from docx import Document
from docx.shared import Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_BREAK
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.dml import MSO_THEME_COLOR_INDEX

INK = '203B32'
INK_2 = '35584A'
GOLD = 'A48245'
PAPER = 'F7F3E8'
PAPER_2 = 'F1EBDD'
LINE = 'D7D0BF'
MUTED = '6B6F66'
WHITE = 'FFFFFF'
RED = '9E4B3F'

BODY_FONT = '宋体'
HEAD_FONT = '黑体'

doc = Document()
section = doc.sections[0]
section.page_width = Cm(21.0)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.0)
section.bottom_margin = Cm(2.0)
section.left_margin = Cm(2.2)
section.right_margin = Cm(2.2)
section.header_distance = Cm(0.9)
section.footer_distance = Cm(0.9)
section.different_first_page_header_footer = True

# ---------- low-level helpers ----------
def set_run_font(run, name=BODY_FONT, size=None, bold=None, color=None, italic=None):
    run.font.name = name
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rPr.append(rFonts)
    rFonts.set(qn('w:eastAsia'), name)
    rFonts.set(qn('w:ascii'), name if name != BODY_FONT else 'Times New Roman')
    rFonts.set(qn('w:hAnsi'), name if name != BODY_FONT else 'Times New Roman')
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.font.bold = bold
    if italic is not None:
        run.font.italic = italic
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color)

def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), fill)
    shd.set(qn('w:val'), 'clear')
    tcPr.append(shd)

def cell_margins(cell, top=90, bottom=90, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement('w:tcMar')
    for key, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{key}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        mar.append(node)
    tcPr.append(mar)

def no_split(row):
    trPr = row._tr.get_or_add_trPr()
    cantSplit = OxmlElement('w:cantSplit')
    trPr.append(cantSplit)

def table_borders(table, color=LINE, size=6):
    tblPr = table._tbl.tblPr
    borders = OxmlElement('w:tblBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        el = OxmlElement(f'w:{edge}')
        el.set(qn('w:val'), 'single')
        el.set(qn('w:sz'), str(size))
        el.set(qn('w:space'), '0')
        el.set(qn('w:color'), color)
        borders.append(el)
    tblPr.append(borders)

def cell_borders(cell, color=GOLD, left_size=24, others=0):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right'):
        el = OxmlElement(f'w:{edge}')
        if edge == 'left' and left_size:
            el.set(qn('w:val'), 'single')
            el.set(qn('w:sz'), str(left_size))
        else:
            el.set(qn('w:val'), 'nil')
        el.set(qn('w:space'), '0')
        el.set(qn('w:color'), color)
        borders.append(el)
    tcPr.append(borders)

def add_page_field(paragraph):
    run = paragraph.add_run()
    fldChar1 = OxmlElement('w:fldChar'); fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText'); instrText.set(qn('xml:space'), 'preserve'); instrText.text = ' PAGE '
    fldChar2 = OxmlElement('w:fldChar'); fldChar2.set(qn('w:fldCharType'), 'separate')
    text = OxmlElement('w:t'); text.text = '1'
    fldChar3 = OxmlElement('w:fldChar'); fldChar3.set(qn('w:fldCharType'), 'end')
    run._r.append(fldChar1); run._r.append(instrText); run._r.append(fldChar2); run._r.append(text); run._r.append(fldChar3)
    set_run_font(run, BODY_FONT, 8.5, color=MUTED)

def add_rule(paragraph, color=GOLD, size=6, space=1):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single'); bottom.set(qn('w:sz'), str(size))
    bottom.set(qn('w:space'), str(space)); bottom.set(qn('w:color'), color)
    pBdr.append(bottom); pPr.append(pBdr)

# ---------- styles ----------
styles = doc.styles
normal = styles['Normal']
normal.font.name = BODY_FONT
normal.font.size = Pt(10.5)
normal.font.color.rgb = RGBColor.from_string('2C2A26')
normal.element.rPr.rFonts.set(qn('w:eastAsia'), BODY_FONT)
normal.paragraph_format.line_spacing = 1.55
normal.paragraph_format.space_after = Pt(6)

for name, size, color, before, after in [
    ('Heading 1', 20, INK, 0, 12),
    ('Heading 2', 13, INK_2, 14, 5),
    ('Heading 3', 11, INK_2, 9, 3),
]:
    st = styles[name]
    st.font.name = HEAD_FONT
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = RGBColor.from_string(color)
    st.element.rPr.rFonts.set(qn('w:eastAsia'), HEAD_FONT)
    st.paragraph_format.space_before = Pt(before)
    st.paragraph_format.space_after = Pt(after)
    st.paragraph_format.keep_with_next = True

for name in ('List Bullet', 'List Number'):
    st = styles[name]
    st.font.name = BODY_FONT
    st.font.size = Pt(10.5)
    st.font.color.rgb = RGBColor.from_string('2C2A26')
    st.element.rPr.rFonts.set(qn('w:eastAsia'), BODY_FONT)
    st.paragraph_format.line_spacing = 1.5
    st.paragraph_format.space_after = Pt(3)

# custom body style without first-line indent
body_style = styles.add_style('Guide Body', WD_STYLE_TYPE.PARAGRAPH)
body_style.base_style = styles['Normal']
body_style.font.name = BODY_FONT
body_style.font.size = Pt(10.5)
body_style.font.color.rgb = RGBColor.from_string('2C2A26')
body_style.element.rPr.rFonts.set(qn('w:eastAsia'), BODY_FONT)
body_style.paragraph_format.line_spacing = 1.55
body_style.paragraph_format.space_after = Pt(6)

lead_style = styles.add_style('Guide Lead', WD_STYLE_TYPE.PARAGRAPH)
lead_style.base_style = styles['Normal']
lead_style.font.name = BODY_FONT
lead_style.font.size = Pt(11.5)
lead_style.font.color.rgb = RGBColor.from_string(INK_2)
lead_style.element.rPr.rFonts.set(qn('w:eastAsia'), BODY_FONT)
lead_style.paragraph_format.line_spacing = 1.6
lead_style.paragraph_format.space_after = Pt(8)

small_style = styles.add_style('Guide Small', WD_STYLE_TYPE.PARAGRAPH)
small_style.base_style = styles['Normal']
small_style.font.name = BODY_FONT
small_style.font.size = Pt(8.5)
small_style.font.color.rgb = RGBColor.from_string(MUTED)
small_style.element.rPr.rFonts.set(qn('w:eastAsia'), BODY_FONT)
small_style.paragraph_format.line_spacing = 1.35
small_style.paragraph_format.space_after = Pt(2)

def para(text='', style='Guide Body', bold_lead=None):
    p = doc.add_paragraph(style=style)
    if bold_lead and text.startswith(bold_lead):
        r1 = p.add_run(bold_lead); set_run_font(r1, BODY_FONT, 10.5, True, INK)
        r2 = p.add_run(text[len(bold_lead):]); set_run_font(r2, BODY_FONT, 10.5, False, '2C2A26')
    else:
        r = p.add_run(text); set_run_font(r, BODY_FONT, 10.5 if style != 'Guide Small' else 8.5, False, '2C2A26')
    return p

def bullet(text, level=0):
    p = doc.add_paragraph(style='List Bullet')
    if level:
        p.paragraph_format.left_indent = Cm(0.75 + level * 0.5)
    r = p.add_run(text); set_run_font(r, BODY_FONT, 10.5)
    return p

def numbered(text):
    p = doc.add_paragraph(style='List Number')
    r = p.add_run(text); set_run_font(r, BODY_FONT, 10.5)
    return p

def h1(text, kicker=None):
    if kicker:
        p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(26); p.paragraph_format.space_after = Pt(2); p.paragraph_format.keep_with_next = True
        r = p.add_run(kicker); set_run_font(r, HEAD_FONT, 8.5, True, GOLD)
    p = doc.add_heading(level=1)
    r = p.add_run(text); set_run_font(r, HEAD_FONT, 20, True, INK)
    add_rule(p, GOLD, 8, 4)
    return p

def h2(text):
    p = doc.add_heading(level=2)
    r = p.add_run(text); set_run_font(r, HEAD_FONT, 13, True, INK_2)
    return p

def h3(text):
    p = doc.add_heading(level=3)
    r = p.add_run(text); set_run_font(r, HEAD_FONT, 11, True, INK_2)
    return p

def callout(title, text, fill=PAPER, accent=GOLD):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Cm(16.0)
    no_split(table.rows[0])
    cell = table.cell(0, 0)
    cell.width = Cm(16.0)
    shade(cell, fill); cell_margins(cell, 120, 120, 170, 170)
    cell_borders(cell, accent, 24, 0)
    p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(2)
    r = p.add_run(title); set_run_font(r, HEAD_FONT, 10, True, accent)
    p2 = cell.add_paragraph(); p2.paragraph_format.space_after = Pt(0); p2.paragraph_format.line_spacing = 1.5
    r2 = p2.add_run(text); set_run_font(r2, BODY_FONT, 10)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def table(headers, rows, widths=None, header_fill=INK, font_size=9, zebra=True):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    table_borders(t)
    if widths:
        for i, w in enumerate(widths):
            t.columns[i].width = Cm(w)
    hdr = t.rows[0]
    no_split(hdr)
    trPr = hdr._tr.get_or_add_trPr()
    tblHeader = OxmlElement('w:tblHeader')
    trPr.append(tblHeader)
    for i, head in enumerate(headers):
        cell = hdr.cells[i]
        cell.width = Cm(widths[i]) if widths else Cm(16/len(headers))
        shade(cell, header_fill); cell_margins(cell, 90, 90, 100, 100)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
        r = p.add_run(head); set_run_font(r, HEAD_FONT, font_size, True, WHITE)
    for ri, row in enumerate(rows):
        new_row = t.add_row()
        no_split(new_row)
        cells = new_row.cells
        for i, value in enumerate(row):
            cell = cells[i]
            cell.width = Cm(widths[i]) if widths else Cm(16/len(headers))
            cell_margins(cell, 80, 80, 100, 100)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if zebra and ri % 2 == 1:
                shade(cell, 'FBF8EF')
            p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.paragraph_format.line_spacing = 1.3
            r = p.add_run(str(value)); set_run_font(r, BODY_FONT, font_size, False, '2C2A26')
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def caption(text):
    p = doc.add_paragraph(style='Guide Small')
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run(text); set_run_font(r, BODY_FONT, 8.5, False, MUTED)

def chapter_break(force=False):
    if force:
        doc.add_page_break()

# ---------- header/footer ----------
header = section.header
hp = header.paragraphs[0]
hp.text = ''
hp.paragraph_format.space_after = Pt(0)
r = hp.add_run('临床五年  /  新玩家规则说明')
set_run_font(r, HEAD_FONT, 8, False, MUTED)
hp.add_run('\t\t')
r2 = hp.add_run('v0.60.0')
set_run_font(r2, BODY_FONT, 8, False, MUTED)
add_rule(hp, LINE, 4, 2)

footer = section.footer
fp = footer.paragraphs[0]
fp.text = ''
fp.paragraph_format.space_before = Pt(0)
r = fp.add_run('虚构作品 · 不构成医学建议')
set_run_font(r, BODY_FONT, 7.5, False, MUTED)
fp.add_run('\t\t')
r = fp.add_run('第 ')
set_run_font(r, BODY_FONT, 8, False, MUTED)
add_page_field(fp)
r = fp.add_run(' 页')
set_run_font(r, BODY_FONT, 8, False, MUTED)

# ============================================================
# COVER
# ============================================================
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(8)
r = p.add_run('JIANJIANG UNIVERSITY SCHOOL OF MEDICINE  /  STUDENT ARCHIVE')
set_run_font(r, HEAD_FONT, 8.5, True, GOLD)

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(40)
r = p.add_run('临床五年')
set_run_font(r, HEAD_FONT, 42, True, INK)

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(2)
r = p.add_run('新玩家规则说明')
set_run_font(r, HEAD_FONT, 24, False, INK_2)

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(8)
r = p.add_run('A FIRST-TIME PLAYER’S GUIDE TO CLINICAL FIVE YEARS')
set_run_font(r, BODY_FONT, 9, False, MUTED)
add_rule(p, GOLD, 8, 8)

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(20)
r = p.add_run('五年，二十一季，慢慢成为医生。')
set_run_font(r, BODY_FONT, 13, False, INK_2)

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(4)
r = p.add_run('这是一份写给第一次进入游戏的你的规则说明：先知道怎样开始，再知道怎样把五年过成自己的样子。')
set_run_font(r, BODY_FONT, 10.5, False, MUTED)

# cover meta table
doc.add_paragraph().paragraph_format.space_before = Pt(38)
meta = doc.add_table(rows=5, cols=2)
meta.alignment = WD_TABLE_ALIGNMENT.LEFT
meta.autofit = False
meta.columns[0].width = Cm(3.4); meta.columns[1].width = Cm(11.8)
for i, (k, v) in enumerate([
    ('适用版本', 'v0.60.0'),
    ('适用对象', '第一次游玩本作的新玩家'),
    ('游戏类型', '医学本科生五年生活文字模拟'),
    ('在线地址', 'https://elijahcyx.github.io/clinical-five-years/'),
    ('文档日期', '2026 年 10 月'),
]):
    row = meta.rows[i]
    for j, value in enumerate((k, v)):
        cell = row.cells[j]
        cell.width = Cm(3.4 if j == 0 else 11.8)
        cell_margins(cell, 80, 80, 0, 80)
        p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
        r = p.add_run(value)
        set_run_font(r, HEAD_FONT if j == 0 else BODY_FONT, 9, j == 0, GOLD if j == 0 else '2C2A26')

doc.add_paragraph().paragraph_format.space_before = Pt(70)
p = doc.add_paragraph()
r = p.add_run('“先把今天过完。明天的事，明天再想。”')
set_run_font(r, BODY_FONT, 10, False, MUTED)
p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
p = doc.add_paragraph()
r = p.add_run('—— 一位不愿透露姓名的学长')
set_run_font(r, BODY_FONT, 8, False, MUTED)
p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

# ============================================================
# CONTENTS
# ============================================================
chapter_break(force=True)
p = doc.add_paragraph()
r = p.add_run('CONTENTS  /  目录')
set_run_font(r, HEAD_FONT, 8.5, True, GOLD)
p = doc.add_paragraph()
r = p.add_run('这本说明会带你走一遍')
set_run_font(r, HEAD_FONT, 20, True, INK)
add_rule(p, GOLD, 8, 4)

toc = [
    ('01', '开始之前', '这是一款什么游戏，以及它不打算成为什么'),
    ('02', '十分钟上手', '从新生报到到第一周结算'),
    ('03', '角色与长期目标', '资质、八维、天赋、背景与毕业条件'),
    ('04', '时间结构', '学期、四周、二十一个时间段'),
    ('05', '核心数值', '精力、压力、生活费、准备度与成长'),
    ('06', '行动与课表', '上课、翘课、自由行动与每日行动'),
    ('07', '考试与学期结算', '复习、成绩、四六级、补考与奖学金'),
    ('08', '人际关系与羁绊', '拍一拍、生日、表白、单独邀约'),
    ('09', '组织与科研', '社团、学生会、导师与论文'),
    ('10', '假期', '寒假、暑假、旅行与假期行动'),
    ('11', '消费型事件', '买断、分期、永久与学年收益'),
    ('12', '随机事件与压力危机', '事件库、心力与结局'),
    ('13', '界面、设置与存档', '电脑端、手机端与解释开关'),
    ('14', '第一学年建议路线', '一份不追求完美的开局参考'),
    ('15', '常见问题', '新玩家最容易问的十几个问题'),
    ('附录', '速查表', '关键数字与规则一页纸'),
]
for no, title, desc in toc:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.tab_stops.add_tab_stop(Cm(1.5))
    p.paragraph_format.tab_stops.add_tab_stop(Cm(16.0), alignment=2, leader=1)
    r = p.add_run(no); set_run_font(r, HEAD_FONT, 9, True, GOLD)
    r = p.add_run('\t' + title); set_run_font(r, HEAD_FONT, 12, True, INK)
    r = p.add_run('\t' + desc); set_run_font(r, BODY_FONT, 8.5, False, MUTED)

callout('阅读建议', '第一次游玩时，不必记住所有数字。先读第 2、4、5、6 章，完成第一周；遇到具体问题时再回来查对应章节。第 14 章提供了一条不追求完美的开局路线。')

# ============================================================
# 01 START
# ============================================================
chapter_break(force=True)
h1('开始之前', '01  /  BEFORE YOU BEGIN')
para('《临床五年》是一款医学本科生五年生活的文字模拟游戏。你不是在操作一所医院，也不是在解一道有标准答案的题；你是在替一个刚入学的学生安排时间、精力、金钱和关系，看五年之后，他会成为一个怎样的人。', 'Guide Lead')
para('游戏从 2021 年秋天的新生报到开始，到 2026 年夏天毕业结束。你会在五个学年、二十一个学期里，经历基础课程、临床前的门槛、见习与实习、考试、假期、社团、科研、恋爱与分离。每一次选择都会消耗某个时间段，而时间段不会回来。')
h2('它想让你体验什么')
bullet('时间的稀缺：一周只有二十一个时间段，学习、休息、社交和赚钱彼此竞争。')
bullet('选择的代价：翘课可能换来一段自由时间，也可能换来一次点名和更低的平时分。')
bullet('长期积累：一次行动不会决定结局，但连续几周的选择会。')
bullet('关系的重量：亲密度不是数值装饰，它会影响邀约、聚餐、生日、复合和结局。')
bullet('不完美的五年：你不需要每一门课都满分，也不需要和所有人成为朋友。')
h2('它不是什么')
para('这不是一个需要背医学知识才能通关的游戏，也不是一个鼓励你照搬“最优解”的游戏。游戏中的课程、病例和人物均为虚构；它不提供医学建议，也不替代真实的医学训练。')
callout('关于剧透', '本说明会解释规则和关键阈值，但不会提前披露具体随机事件的文本。你可以放心在第一次游玩时阅读。', PAPER_2)
h3('给第一次游玩的你')
para('不要在第一学期追求“全都要”。选一个能让你安全理解系统的计划，保留一两个时间段给休息和关系。第一次游玩的目标不是打出完美结局，而是知道每个按钮会把时间带到哪里。')
para('如果某个选择看起来明显不划算，先看它消耗的是精力、压力还是准备度。这三年后你会感谢现在没有把三颗心一次性碎完的自己。')
h2('开始游戏前，你只需要知道三件事')
table(['你管理的资源', '它决定什么', '最容易忽略的地方'], [
    ['精力', '还能不能继续行动、上课和复习', '精力低于 20 会触发低精力提醒；付不起的行动会变灰'],
    ['压力', '习惯是否有效、备考收益、心力安全', '压力超过 60 习惯失效，超过 80 会碎心'],
    ['准备度', '考试卷面分的核心来源', '不是“学了就有分”，而是要把准备度堆到考试周'],
], widths=[4.2, 6.0, 5.8])
para('金钱、体质、英语、科研、人际和亲密度也重要，但它们大多服务于上面三件事。先把精力、压力和准备度照顾好，其他系统会慢慢展开。')

# ============================================================
# 02 QUICK START
# ============================================================
chapter_break()
h1('十分钟上手', '02  /  YOUR FIRST TEN MINUTES')
para('第一次进入游戏时，照下面的顺序走一遍，就能完成一个完整学期。', 'Guide Lead')
h2('第 1 步：领取学生证')
para('在标题页点击「领取学生证，开始五年」。如果你之前保存过进度，也可以点击「继续上次档案」。游戏会自动保存在浏览器本地；换浏览器或清理站点数据会丢失存档。')
h2('第 2 步：新生报到')
para('你需要确定姓名、性别、家庭背景、资质和八维属性，并选择性取向。资质决定可分配属性点：平庸 35、出色 45、精英 55、天才 65。开局分配时八维属性每项最低 2、最高 10；进入游戏后仍可继续成长，上限为 15。新手不必追求“完美分配”，可以先按自己的游玩风格来：')
table(['属性', '主要影响'], [
    ['记忆力', '背诵型课程的准备度；四六级与考研'],
    ['悟性', '理解难题、临床推理、科研与部分事件'],
    ['操作', '实验、查体、穿刺、缝合等临床操作'],
    ['人际', '关系、信息、求助、面试与亲密度变化'],
    ['建模', '第一印象、部分社交事件；不参与医疗判定'],
    ['精力', '行动消耗与恢复效率'],
    ['体质', '体测、夜班、体力消耗'],
    ['抗压', '压力增长与崩溃阈值'],
], widths=[4.2, 11.6])
para('家庭背景决定每月生活费：平民 1500、小康 2000、中产 2500、名门 3000。学期内每天还会按家境扣除固定开销；生活费不是“越多越好”，但太紧会让你在消费事件和社交选择前反复犹豫。')
h2('第 3 步：选择天赋')
para('资质越好，可查看和选择的天赋越多。天赋会改变开局或长期规则，但不决定结局。第一次游玩可以选择一个你感兴趣的，而不是查表追求最强。')
h2('第 4 步：选选修课')
para('每学期计划前会展示水课、兴趣课、小组作业课和思政课。思政课是必修；其他三类最多选 3 门。选修课毕业最多计入 10 学分，因此不必每学期都塞满。水课容易拿分，兴趣课给压力和精力收益，小组作业课增加人际但消耗精力。')
h2('第 5 步：制定学期计划与习惯')
para('每个学期选择 A 稳扎稳打、B 周期回顾或 C 考前突击，再选择两个养成习惯。计划决定被动准备度和每周精力/压力消耗；习惯在工作日结算，压力超过 60 时会失效。')
h2('第 6 步：进入第一周')
para('主界面显示七天 × 三个时段的课表。当前时间段若有课，你只能选择「去上课」或「翘课」；没有课则可以自由行动。每做一次决定，时间推进一个时间段。二十一个时间段结束后，本周自动结算。')
callout('新手最容易犯的错', '看到空时间段就立刻塞满行动。请先看当前精力与压力，再决定是学习、休息还是社交。一次行动只占一个时间段，但它的精力/压力后果会陪你到下周。')
h2('第 7 步：考试周')
para('前三周结束后进入考试周。你需要为每门必修/思政课安排复习方式：均衡复习、主攻一门、历年卷 + zsy 笔记，或休息。复习结束后出成绩，再进入假期或下一学期。')
h2('第 8 步：假期')
para('假期没有考试，也不扣每天固定生活费。每周选择两个假期行动，例如回家、旅行、兼职、健身或学英语。假期结束前可以安排一次旅行；旅行会消耗生活费并触发同行事件。')

# ============================================================
# 03 CHARACTER
# ============================================================
chapter_break()
h1('角色与长期目标', '03  /  THE STUDENT YOU BUILD')
h2('资质与八维')
para('资质只决定开局属性点的总量，不影响后续成长上限。开局分配时八维属性每项 2–10；进入游戏后上限提升至 15，10 到 15 这一段只能靠大学阶段的成长获得。成长值按百分比累积：某项成长值达到 100% 时，对应属性 +1。属性越高，相关行动和事件的收益越明显，但不存在“必须满 15 才能通关”的要求。')
para('在「我是谁」和档案面板中，八维进度条 2/3 处有一条红线，对应 10 点：这是入学时能带进大学的天赋上限。红线右侧的 1/3 只能靠玩家在游戏中的努力。某项属性达到 15 后，其对应成长值会归零，并停止继续增长。')
h2('家庭背景与金钱')
table(['背景', '每月生活费', '每日固定开销（学期内）'], [
    ['平民出身', '1500', '50'],
    ['小康家庭', '2000', '60'],
    ['中产阶级', '2500', '70'],
    ['名门望族', '3000', '80'],
], widths=[5.0, 5.0, 5.8])
para('生活费在学期内按天扣除，假期在家不扣固定开销。兼职、比赛奖金、奖学金、家人红包和部分事件会增加生活费；消费事件、约会、聚餐、旅行和礼物会减少生活费。付不起的行动会变灰，无法选择。')
h2('天赋与性取向')
para('天赋分为开局型、成长型和事件型，效果包括英语加成、压力减免、精力恢复、社交便利、考试容错等。性取向会影响社交与恋爱事件中 NPC 的性别和称呼，不改变课程与考试规则。')
h2('长期目标')
para('游戏没有单一的“胜利画面”，但有一个明确的毕业门槛：修满 196 学分（专业/临床 157、体育测试 10、体育课 8、思政 11、选修 10）、CET-6 达到 550、补考全部通过、体育毕业补考通过。满足后进入毕业结算；否则进入延毕或对应结局。')
table(['目标', '要求', '备注'], [
    ['总学分', '196', '专业/临床157 + 体育测试10 + 体育课8 + 思政11 + 选修10'],
    ['英语', 'CET-6 ≥ 550', 'CET-4 通过后才能报考 CET-6'],
    ['补考', '全部通过', '挂科会在下一学期出现补考'],
], widths=[3.8, 5.0, 7.0])
para('除了毕业，你还可以追求保研、考研、就业、科研发表、奖学金、稳定关系或更完整的自我。它们不是互斥的，但都需要时间。')

# ============================================================
# 04 TIME
# ============================================================
chapter_break()
h1('时间结构', '04  /  HOW FIVE YEARS MOVE')
para('理解时间，是理解这款游戏的第一步。', 'Guide Lead')
h2('五年与二十一个学期')
para('游戏从大一秋季开始，到大五夏季结束。普通学年有秋、冬、春、夏四个学期；大三夏季会被「临床前学期」替代；大四、大五没有寒暑假，直接进入临床见习与实习。每个学期都遵循同一套“三周行动 + 一周考试”的节奏。')
table(['阶段', '学期安排', '主要任务'], [
    ['大一', '秋 / 冬 / 寒假 / 春 / 夏 / 暑假', '基础课程与适应大学生活'],
    ['大二', '秋 / 冬 / 寒假 / 春 / 夏 / 暑假', '桥梁课程、病理与药理'],
    ['大三', '秋 / 冬 / 寒假 / 春 / 临床前学期', '临床基础课与临床前综合考核'],
    ['大四', '秋 / 冬 / 春 / 夏', '见习、轮转、毕业去向选择'],
    ['大五', '秋 / 冬 / 春 / 夏', '实习、推免/考研、毕业结算'],
], widths=[3.0, 6.2, 6.6])
h2('一周的二十一个时间段')
para('一周有七天，每天分早上、下午、晚上三个时间段，共 21 个。每一个时间段只能做一个决定：有课时上课或翘课，没课时选择一个自由行动。时间推进不可撤销；如果选错了，只能在下个时间段补救。')
table(['时段', '通常发生什么', '新手注意'], [
    ['早上', '课程、睡懒觉、早起习惯结算', '早上有课时不能睡懒觉；早起习惯会额外加准备度'],
    ['下午', '课程、图书馆、运动、兼职、社团', '精力最低的时候，学习收益会下降'],
    ['晚上', '课程、社交、组局、单独邀约、休息', '晚间咖啡会影响当夜睡眠'],
], widths=[3.0, 7.2, 5.6])
h2('前三周与考试周')
para('第 1–3 周是行动周，每周 21 个时间段；第 4 周是考试周，不进入课表循环，而是进入专门的复习与考试界面。考试周结束后，本学期结束：成绩单 → 假期 → 下一学期。')
para('考试周不是“额外送你的复习时间”。前三周积累的准备度、精力和压力，都会在考试周结算。')
h2('学期计划')
para('学期计划决定你每周的被动准备度和精力/压力消耗。它没有绝对强弱，只适合不同的课程难度和玩法。')
table(['计划', '被动准备度', '每周代价', '考试周倍率'], [
    ['A 稳扎稳打', '每门课每周 +3 × K', '每天精力 -4、压力 +2', '×1.0'],
    ['B 周期回顾', '每门课每周 +1 × K', '周六、周日各精力 -8、压力 +3', '×1.1'],
    ['C 考前突击', '前三周无被动准备度', '前三周无额外消耗', '×1.5'],
], widths=[3.6, 6.2, 7.0, 2.0])
para('第一次游玩更推荐 A 或 B：C 看似省精力，但如果考前一周被事件或低精力打断，很容易翻车。')
h3('考前遗忘')
para('复习收益结算后、真正评分前，系统会对每门专业课和思政课分别进行一次「遗忘扣减」。扣减后的准备度才会用于评分，并显示在成绩单的「考前遗忘」标签里。补考课程同样受遗忘影响。')
table(['计划', '3 学分基础范围', '5 学分约', '设计目的'], [
    ['A 稳扎稳打', '0–3 点', '0–5 点', '复习节奏稳定，遗忘最少'],
    ['B 周期回顾', '8–16 点', '13–27 点', '有周期性回顾，但仍会忘掉一部分；存在挂科风险'],
    ['C 考前突击', '15–25 点', '25–42 点', '临时抱佛脚，遗忘最严重；最容易翻车'],
], widths=[3.4, 4.0, 3.6, 4.6])
para('遗忘范围会按课程学分缩放：1 学分约为 3 学分课程的 1/3，5 学分约为 1.67 倍。这样 1 学分导论不会被大课的固定扣减压垮，而 5 学分硬课会真正产生压力。复习页会显示本计划的基础范围，成绩单显示本门课实际扣减。')

h2('自动结算与手动保存')
para('每周结束、每学期结束和重要选择后，游戏都会自动保存到浏览器本地。你也可以使用保存按钮手动保存。读档时，版本会尽量兼容旧存档；但跨大版本仍建议从新学期开始。')

# ============================================================
# 05 STATS
# ============================================================
chapter_break()
h1('核心数值', '05  /  THE NUMBERS THAT MATTER')
para('游戏里有很多数字，但真正需要一直盯着的是精力、压力、准备度和生活费。其他数值是长期投资。', 'Guide Lead')
h2('精力')
para('精力是行动燃料。上课、图书馆、运动、兼职都会消耗精力；睡觉、躺平、咖啡、假期休息会恢复精力。精力低于 20 会触发低精力提醒，但不会额外增加行动消耗；无法支付消耗的行动会变灰。部分学习行动（例如泡图书馆）在低精力下准备度收益会下降，先恢复再学习通常更划算。')
h2('压力与心力')
para('压力是行动的副作用。压力超过 60，习惯失效；超过 70，考试准备度收益 -10%；超过 80，会碎一颗心，并挂上高压 debuff。三颗心碎完后，如果新的一周压力仍然 ≥80，游戏会进入压力结局。')
callout('心力规则', '第一次和第二次碎心时，辅导员/导师/舍友可能找你谈心并降低压力；第三次碎心不会自动降压。不要等到第三颗心才休息。', PAPER_2, RED)
h2('生活费')
para('生活费是有限资源。学期内每天固定扣除 50–80 元（按家境），行动、社交、约会和消费事件会额外扣除。假期在家不扣固定开销，但仍可能因旅行、娱乐、社交支出花钱。')
h2('准备度、卷面分与绩点')
para('每门课都有一个 0–100 的准备度。准备度越高，考试卷面分越稳。课程难度由记忆/理解要求、学分和 K 系数共同决定；同样的准备度，在硬课上不一定换来同样的分数。最终成绩由平时分和卷面分组成，再换算成 5 分制绩点。')
h2('成长值')
para('英语、体质、建模（原“外形”）、人际等成长值按百分比累积。100% 会转化为对应属性或能力 +1；负向成长低于 0% 时可能扣回属性。成长值是长期指标，不要因为一周没涨就焦虑。对应属性达到 15 后，成长值归零并停止累计。')
h2('综测、英语、科研与亲密度')
table(['数值', '主要来源', '主要用途'], [
    ['综测', '组织活动、志愿、竞赛、奖学金', '奖学金、保研与部分履历'],
    ['英语', '学英语、背单词、英语备考、四六级', 'CET-4/6、保研/考研与部分事件'],
    ['科研', '科研行动、导师事件、论文发表', '奖学金、保研与结局'],
    ['亲密度', '拍一拍、聚餐、生日、单独邀约', '关系推进、羁绊、邀约成功率'],
], widths=[3.2, 7.0, 5.6])
para('这些数值不需要每天盯。把它们当作“长期账户”，在关键节点前集中投入即可。')

# ============================================================
# 06 ACTIONS
# ============================================================
chapter_break()
h1('行动与课表', '06  /  WHAT YOU CAN DO')
para('每个空时间段都可以安排一个行动。行动分为课表行动、自由行动和每日行动三类。', 'Guide Lead')
h2('上课与翘课')
para('当前时间段有课时，主界面只提供「去上课」和「翘课」。去上课会消耗精力、增加该课程准备度，并降低被点名的风险。翘课会进入点名方式抽选：老师可能随机点名、抽查签到或使用其他方式；被抓到会扣平时分，并留下记录。翘课成功后，当前时间段变成自由行动时间。')
para('到课获得的准备度按课程学分递减：1–2 学分每次 +5，3–4 学分每次 +4，5 学分及以上每次 +3。早起习惯仍可额外 +1。学分高、课时多的大课不再能只靠点名式到课堆满准备度。')
para('如果你在翘课后的当前时间段成功安排单独邀约，课表会并列显示「课程」与「翘课 + 邀约事件」，这是正常现象，不是显示错误。')
h2('自由行动')
table(['行动', '大致效果', '适合什么时候'], [
    ['泡图书馆', '所有在修课程准备度 +K；精力/压力消耗随课程数增加', '考试前、准备度落后时'],
    ['小组作业 / 选修课程', '非思政选修 +10、思政 +8；精力 -10、压力 +3', '有选修作业、需要拉分时'],
    ['科研相关', '科研 +2–6；精力 -20、压力 +3；需要导师', '已有导师、想冲论文/保研时'],
    ['社团活动', '人际成长 +5%；精力 -8、压力 +3、生活费 -5', '需要组织收益或人际时'],
    ['躺平', '精力 +15、压力 -10', '精力见底、需要保命时'],
    ['组局', '精力 +8、压力 -15；生活费按人数结算；赴约者分 6 点亲密度', '想同时推进多段关系时'],
    ['单独邀约', '聊天邀约；成功后 +5 亲密、-10 精力、-50 生活费', '想推进恋人/兄弟/闺蜜关系时'],
    ['兼职', '生活费 +120、精力 -20、压力 +5、体质成长 +5%', '缺钱但精力充足时'],
    ['运动', '精力 -5、压力 -10、体质成长 +10%', '压力高、体质落后时'],
    ['学英语', '英语成长 +100%、精力 -6、压力 +2', '准备四六级/保研时'],
    ['高碳日！爱你老己', '精力 +10、压力 -15、生活费 -30、体质成长 -5%', '压力高但不想运动时'],
], widths=[4.4, 7.2, 4.2])
caption('注：数值会随天赋、习惯、消费资产和事件变化；表中为基准值。')
h2('每日行动')
para('每天还可以使用一次「喝咖啡」和一次「高碳日！爱你老己」之类的每日行动，它们不占时间段。喝咖啡通常精力 +10、生活费 -10；高碳日精力 +10、压力 -15、生活费 -30、体质成长 -5%。如果你买了宿舍咖啡机，喝咖啡不再扣生活费。')
para('早上还可以选择「睡懒觉」：精力 +20、压力 -10，但会占用整个早上，并在某些习惯或状态下不可用。喜欢早起的人，可能更适合把早上留给课程或图书馆。')
h2('行动前的确认')
para('选择行动时，界面会预览结算后的精力、压力、生活费和准备度变化。浅色或斜线部分表示“预计变化”，正式结算前请再看一眼。时间推进后不能撤销，务必确认。')

# ============================================================
# 07 EXAMS
# ============================================================
chapter_break()
h1('考试与学期结算', '07  /  EXAM WEEK')
para('考试周是前三周选择的收束。它不是独立的小游戏，而是对准备度、精力和压力的一次总检查。', 'Guide Lead')
h2('复习方式')
table(['复习方式', '效果', '适合'], [
    ['均衡复习', '所有必修/思政课获得均衡准备度；精力 -20', '多门课都悬、没有明显短板'],
    ['主攻一门', '把主要收益集中到一门课；精力 -20', '某一门课最危险或最想拉高'],
    ['历年卷 + zsy 笔记', '收益接近均衡，波动更小，但卷面上限 95', '求稳、想降低翻车概率'],
    ['休息', '精力 +20、压力 +5', '精力见底、再复习也吃不到收益'],
], widths=[4.0, 8.0, 4.0])
para('考试周的额外操作不占行动次数，但不可撤销：喝咖啡（生活费 -50、精力 +10、压力 +5、准备度收益 +15%，每场一次）、刷夜（精力 -10、体质成长 -10、压力 +10、准备度 +15，但本次成绩下调 5%，每场一次）、英语备考（精力 -10、压力 +5、英语 +5，并影响当次 CET 概率）。')
h2('成绩、补考与奖学金')
para('成绩由平时分和卷面分组成，按 5 分制绩点记录。成绩单会按课程依次列出：平时分、卷面分、总分、绩点、降压。普通必修课：平时分 20 分 + 卷面分 × 80%；思政课：40 分 + 卷面分 × 60%；兴趣/水课：50 分 + 卷面分 × 50%。卷面分为 0–100，总分四舍五入并限制在 0–100。挂科会在下一学期作为补考课程出现；补考通过后学分只算一次，绩点按原绩点和补考绩点平均。每门课出分后还会按预计区间结算一次压力奖励。')
para('每学年秋季开学评审上一学年奖学金：成绩、综测、科研、面试和履历共同决定国奖/省奖/校奖。挂科会永久锁定国奖，并取消当年省奖；校奖不受影响。')
h2('挂科警告、补考与退学线')
para('如果成绩单上出现挂科课程，结算页会先弹出一份橙红色学习报告，列出本次未通过课程、学分和本学期行为统计，例如去过几次图书馆、上了多少节课、翘课、睡懒觉、运动与社交次数。这不是装饰性提示：它同时会告诉你，目前累计还有多少学分没有通过。')
para('挂科课程会以「补考」身份进入下一学期。学期计划、课表和补考成绩行都会显示补考标签；补考在通过前会一直保留在「待补考」状态，不会因为进入新学期就消失。补考通过后，学分只计算一次，最终绩点按原绩点与补考绩点的平均值计算。')
table(['状态', '规则'], [
    ['任意挂科', '成绩单弹出挂科报告；相关课程进入下学期补考'],
    ['补考通过', '获得课程学分；最终绩点 = 原绩点与补考绩点的平均，向下取整到 1 位小数'],
    ['补考再次挂科', '继续保留补考；不会重复计算已修学分'],
    ['退学线', '累计未通过的专业课 + 思政课学分 ≥ 20 分'],
    ['不计入退学线', '选修课挂科不计入累计退学学分'],
], widths=[4.2, 11.4])
para('累计未通过学分达到 20 分时，挂科报告会升级为「退学预警」。点击确认后进入退学结局，不能继续正常学期；只能重新开始或回到标题。退学结局文案从一组随机文本中抽取，与压力结局一样是独立的终止结局。')
para('因此，补考不是“重来一次考试”的按钮，而是把课程重新学一遍的机会。任何时候看到「补考」标签，都意味着这门课还没有真正通过。')
h2('四六级')
para('每学年有两次四六级机会，冬季和夏季大考前报名。CET-4/CET-6 总分 750，通过线 425；CET-6 达到 550 才算毕业英语合格。英语成长值越高，考试保底越稳。CET-4 通过后不能重考；CET-6 通过后仍可继续刷分。')
h2('学年结算')
para('大一至大四结束后进入学年结算，再继续下一学年；大五进入毕业/延毕结算。大四春需要选择毕业去向，大五秋公布推免结果，大五冬考研初试，大五春考研结果。')

# ============================================================
# 08 RELATIONSHIPS
# ============================================================
chapter_break()
h1('人际关系与羁绊', '08  /  PEOPLE MATTER')
para('关系不是附加剧情，而是会影响时间、金钱、压力和结局的第二套资源系统。', 'Guide Lead')
h2('关系分类')
para('「TA 是谁」页面可以按「全部 / 长辈 / 同辈 / 前辈」筛选。长辈是导师与辅导员；同辈是舍友、朋友、同学与恋人；前辈是课题组里的同门师兄师姐，以及社团、学生会、辩论队里认识的学长学姐。前辈同样占用交心朋友名额。')
h2('亲密度')
para('每段关系有 0–100 的亲密度。亲密度越高，越容易解锁对方的面板、触发关心事件、接受邀约、建立羁绊。双方人际之和越高，亲密度变化还有额外加成。亲密度不会自动上涨，需要你主动花时间或花钱。')
h2('交心朋友上限')
para('只有非长辈的同辈会占用「交心朋友」名额：舍友、朋友、同学、社团成员、恋人，以及未来出现的同门与社团前辈。导师和辅导员不占名额，也不受这个机制影响。当前亲密度 ≥60 的同辈即视为交心朋友。')
para('交心朋友最多 5 人。未满 5 人时，其余亲密度低于 60 的同辈，正向亲密度增长会随交心人数变慢：')
table(['已交心人数', '其余同辈成长倍率'], [
    ['0 人', '100%'],
    ['1 人', '85%'],
    ['2 人', '70%'],
    ['3 人', '55%'],
    ['4 人', '40%'],
    ['5 人', '25%，且亲密度最高只能到 59'],
], widths=[4.2, 11.4])
para('已有 5 个交心朋友时，第 6 个同辈无论如何都不会达到 60；如果当前是 59，正向增长会显示为 +0，并提示「交心名额已满」。某个交心朋友掉回 60 以下后，名额会立即释放，其他同辈可以继续成长。')
para('亲密度 60 同时也是表白门槛，因此 5 个名额满时无法向第 6 个停在 59 的同辈表白。这个限制同样作用于已有存档。')
h2('拍一拍')
para('在「TA 是谁」页面可以每周拍一拍。普通周每人一次、全周最多 3 次；假期共有 5 次，不按周刷新。拍一拍通常 +2 亲密度，并可能触发借笔记（随机一门在修课程准备度 +3）、请奶茶、导师指点、辅导员谈心等事件。无论是否触发事件，拍一拍本身都不占行动时间段。')
para('连续三周不拍朋友，亲密度会下降；降到 15 以下后下降速度变慢。舍友在非假期每周会自动 +3 亲密度，因此不要忽略同宿舍的人。')
h2('生日、表白与恋爱')
para('亲密度达到 40 后，生日月份可以送礼（生活费 -150、亲密度 +15，受交际加成）或只送祝福（+5）。错过生日月份会扣亲密度，并可能让 TA 在三周内不愿被拍一拍。')
para('亲密度超过 60 且性别/性取向允许时可以表白。表白成功会建立恋人关系；失败后按钮会禁用。你可以同时维持多段恋爱，但每周都会累积被发现风险，被发现后关系破裂、交际下降、压力上升。')
h2('羁绊')
para('在关系页可以将满足条件的对象建立为恋人、兄弟或闺蜜羁绊。羁绊会解锁「联系 TA」、单独邀约、羁绊事件与解除/复合。解除羁绊后有三周冷静期，亲密度冻结，期间可以提出一次复合；复合概率受亲密度、八维和冷静周数影响。')
h2('单独邀约')
para('单独邀约是自由行动卡，只能在空闲时间段使用。点开后进入聊天窗口：你先发「在吗？」，对方回复，然后从四个邀约选项中选择一个。对方是否接受取决于亲密度，基础成功率为 25% + 亲密度 × 0.75%，最高 100%。')
bullet('每位羁绊每个时间段只能邀约一次；同一时间段重复进入只显示已冻结的对话。')
bullet('每位羁绊每周最多成功应邀 2 次；约满后仍可点击联系人，查看本周聊天记录。')
bullet('成功后会安排具体赴约时间段；到了时间，主界面会出现「去赴约」提示。')
bullet('赴约通常增加亲密度 +5、精力 -10、生活费 -50；消费资产和事件可以改变这些数值。')
bullet('被婉拒不会灰显联系人；本时间段不能再次邀约，换个时间段可以重新尝试。')
callout('不要只刷亲密度', '单独邀约要花时间、精力和生活费。把邀约安排在不会拖垮考试周的时段，关系才会成为支持，而不是负担。', PAPER_2)

h2('常驻聊天与代称')
para('「关系网」与「日记」之间新增常驻「聊天」页签。左侧是所有恋人、兄弟、闺蜜羁绊，右侧是聊天记录；单独邀约产生的对话和八卦都会留在同一个时间线里，按游戏中的周次与时间段排序。')
para('成功建立羁绊后会自动进入对应聊天，对方先问「你……想怎么称呼我呢？」，并给出三个预设代称和一个自定义输入框。确认后玩家发送「我要叫你 XXX！」，关系名会在关系页、聊天页等处统一显示为这个代称。聊天右上角可以修改代称，也可以临时关闭代称、恢复本名；解除羁绊时代称会自动清除并恢复原名。')
h2('关系网')
para('原「相识」页签已更名为「关系网」。关系网以玩家名字为中心，玩家认识的人作为节点；玩家到每个人的连线长度由亲密度决定，越亲密越近。布局固定，节点和画布都不需要拖动，鼠标悬停连线可以查看双方关系与亲密度。')
para('关系网只显示玩家已经知道的信息。玩家与直接认识的人之间的连线默认可见；NPC 之间的普通舍友/同组织关系如果属于公共常识，开局即可见；恋爱、兄弟、闺蜜、暗恋、前任、矛盾等秘密关系需要发现。未发现的秘密不会出现在图上，只会在八卦或事件中逐步揭示。')
para('节点名字会自动在上下左右及斜向候选中避让连线，优先避开实线，其次避开虚线。未认识的八卦当事人显示为「？？」，不会透露姓名。')
h2('NPC 社交与八卦')
para('创建角色时，系统会在 NPC 之间生成一层社交关系：舍友、同组织等公开关系，以及恋人或兄弟/闺蜜、暗恋、矛盾等隐藏关系。NPC 关系每周有低概率发生少量变化，但不会主动给玩家已有的羁绊对象生成冲突羁绊。')
para('聊天页每个羁绊对象都有「问八卦」按钮。每个对象每周可以问一次，不消耗行动时间段；即使对方拒绝或没有情报，本周该对象的机会也会用完。系统会从「至少涉及一个玩家认识的人、且玩家尚未知道」的关系中随机抽取一条，按以下概率决定是否告知：')
para('告知概率 = 50% + 0.5 ×（玩家与羁绊对象的亲密度 − 羁绊对象与两位当事人的平均亲密度），最终限制在 5%–80%。玩家与对象越熟、对象与当事人越不熟，越可能听到八卦。')
para('告知成功时，关系网会新增对应关系；如果只认识其中一方，另一方显示为「？？」。对方说话后，玩家会从 30 条回复文段中自动回复一条。对方拒绝时也会从拒绝类回复中抽取，不揭示任何关系。八卦发生的时间段会被记录，之后即使时间推进，历史记录仍显示原来询问的时间。')
para('除了聊天八卦，少量随机事件也会揭示 NPC 之间的秘密关系，并同步到关系网；这些信息不会改变现有的恋爱风险或其他数值机制。')

# ============================================================
# 09 CLUBS/RESEARCH
# ============================================================
chapter_break()
h1('组织与科研', '09  /  CLUBS, MENTORS, PAPERS')
h2('加入组织')
para('大一大二可以加入社团、学生会或辩论队，最多同时加入两个；不同轨道之间有互斥规则。组织会强制占用一个时间段，你需要参加活动或请假。每学期活动次数不足会收到警告，连续缺席可能被移出组织。')
para('组织活动有概率触发学科、兴趣或实践类随机事件，并带来综测、人际成长和课程准备度收益。担任职务会提高收益，但也要承担更多活动。每学期达到条件还能领取组织福利。')
h2('邮箱与导师联系')
para('「本周安排」和「档案」之间新增「邮箱」页签。邮箱左侧是收件箱/已发送列表，右侧是邮件正文；未读邮件会在邮箱页签右上角显示感叹号。发送和阅读邮件不消耗行动时间段，邮件内容由系统根据玩家当前履历自动生成，不可编辑。')
para('邮箱只在正常学期周（第 1–3 周）可查看。阶段 1 时，每周最多向一位导师发送一封自荐邮件；同一时间只能有一个正在等待回复/联系中的导师。消极回复或面谈失败后，下周可以换导师；同一导师被婉拒或面谈失败后不能再次申请。')
h3('联系导师的六个阶段')
table(['阶段', '名称', '进入条件'], [
    ['1', '未联系导师', '开局状态；可以在科研页查看所有导师'],
    ['2', '联系上导师', '已读导师的积极回复；邮件内包含面谈时间'],
    ['3', '与导师面谈', '到达约定面谈时间段；面谈占用整个时间段'],
    ['4', '正式进入课题组', '面谈成功；导师关系创建，亲密度固定 20'],
    ['5', '允许进入实验室', '导师亲密度 40，收到实验室邮件并已读后的下一游戏日'],
    ['6', '科学研究', '导师亲密度 60，收到课题邮件并接受；科研进度从 0 开始'],
], widths=[1.6, 5.2, 9.4])
para('阶段 4 之前，导师不会出现在「TA 是谁」的亲密关系列表里；阶段 4 之后导师属于长辈，初始亲密度 20。阶段 4 的欢迎邮件已读后，会生成 3 位同门师兄/师姐，初始亲密度 10–20。他们属于「同门前辈」朋友，占用交心朋友名额，也可以按现有规则发展恋爱关系。')
h3('自荐与回复')
para('在科研页的教师名录中选择一位导师，查看 TA 的性别、职务、研究方向和代表期刊；进入教师个人主页后点击「邮件联系」，会自动跳转到邮箱并播放自荐信逐字出现和发送动画。每位导师有独立的积极/消极回复文本库。')
para('积极回复概率 = 基础 30% + 判定概率（最多 40%），即 30%–70%。判定概率由当前年级（30%）、累计 GPA（40%）和人际（30%）共同决定；消极回复固定 20%，不回复吸收剩余概率（最低 10%）。没有回复时，会在下一个正常学期周开始时弹出提醒，玩家可以在那一周继续联系其他导师。')
para('积极回复在本周稍后的空闲时间段到达；如果本周已没有合适的空闲时间，则顺延到下一个可行动周。积极回复只在被阅读后才进入阶段 2；如果一直未读，面谈不会激活。')
h3('面谈')
para('积极回复会指定一个玩家空闲时间段进行面谈，面谈占用整个时间段；约定时间会同步显示在课表格子和「本周概览」卡片中。时间到时会弹出「去面谈」提示。点击后播放约 5 秒的面试动画，再显示面谈结果窗口；只有确认结果后才会进入下一时间段。面谈结束后，该时间段仍会以「面谈已结束」保留在课表和本周概览中。若读信时约定时间已过，会自动改约一次；错过面谈也会自动改约一次。')
para('面谈成功率由悟性（4）、操作（3）、建模（2）、交际（1）加权计算，换算到 30%–100%。面谈成功后进入阶段 4；失败则回到阶段 1，该导师不能再申请。若本周还没有给新导师发过邮件，失败后会保留/补充一次本周联系机会。')
h3('实验室与课题')
para('阶段 4 后导师亲密度从 20 开始。达到 40 时导师会发来实验室门禁邮件；邮件已读后的下一个游戏日进入阶段 5。阶段 5 可以做实验室学习/打杂行动，但只增加导师亲密度，不累计科研进度。')
para('阶段 5 且导师亲密度达到 60 时，导师会通过邮件发来课题邀请。阅读邮件后点击「接受课题，开始科研」，进入阶段 6，科研进度变为 0；在此之前科研进度显示为「—」。进入阶段 6 后，「科研相关」行动才开始随机增加 2–6 点科研进度，悟性越高越容易获得高值。')
para('连续三周不推进课题会收到导师警告；科研进度达到 100 会触发论文发表，并按导师等级随机期刊。')
para('假期「实验室牛马」仍然要求已经进入实验室（阶段 5 及以上）。')
h3('医学世家')
para('选择「医学世家」开局天赋时，系统会随机分配一位导师。游戏开始后，这位导师会先发一封问候邮件；下一天会发来正式接纳邮件。读完接纳邮件后直接进入阶段 4，导师亲密度为 20，欢迎邮件已读后生成 3 位同门前辈。')
callout('旧存档已作废', '本版本使用新的邮箱/科研状态，旧版本本地存档会被清除。第一次打开新版游戏的玩家只能创建新存档。', PAPER_2, RED)

# ============================================================
# 10 VACATION
# ============================================================
chapter_break()
h1('假期', '10  /  BETWEEN SEMESTERS')
para('假期是恢复和补短板的窗口，不是“空白时间”。', 'Guide Lead')
para('大一和大二有寒假、暑假；大三只有寒假，夏季进入临床前学期；大四、大五没有假期。假期没有考试，也不扣每天固定生活费，但每周仍然只能选择两个假期行动。')
h2('假期行动')
table(['行动', '大致效果'], [
    ['回家 / 陪家人', '精力 +15、压力 -10、生活费 +100'],
    ['出门旅行', '精力 -5、压力 -30、生活费 -500（可邀请朋友同行）'],
    ['社会实践 / 志愿', '综测 +6、精力 -15、压力 +5'],
    ['假期兼职', '生活费 +500、精力 -20、压力 +4'],
    ['健身 / 运动', '体质成长 +10%、精力 -5、压力 -10'],
    ['学英语', '英语成长 +5%、精力 -10、压力 +5'],
    ['纯粹的休息', '精力 +20、压力 -20'],
    ['娱乐 / 追剧', '精力 +10、压力 -15、生活费 -100'],
    ['约朋友耍起', '人际成长 +20、精力 -5、压力 -15、生活费 -200'],
    ['实验室牛马', '科研 +5、精力 -10、压力 +10、生活费 -50；需已进实验室'],
], widths=[4.4, 11.4])
h2('旅行')
para('假期可以安排一次旅行：选择同行朋友，按亲密度判定是否应邀。单人、双人、三人以上的费用不同；确认同行后立即结算行动、精力、压力和费用。旅行会触发 1–3 段共享旅行事件，选项后果在点击后揭晓。')
para('旅行事件也会花钱：买饮料、换房间、吃当地菜、赶车等选择都有不同代价。出发前留出比预算多一点的生活费，避免在旅途中被迫放弃关键选项。')

# ============================================================
# 11 CONSUMPTION
# ============================================================
chapter_break()
h1('消费型事件', '11  /  SPEND, INSTAL, LIVE WITH IT')
para('消费型事件是学期周中随机出现的“可选购买”弹窗。它不是普通随机事件，也不占行动时间段。', 'Guide Lead')
h2('怎么触发')
para('在学期第 1–3 周、没有其他待处理事件时，系统会按概率检查是否弹出消费型事件；同一周最多出现一次。你可以在弹窗里选择立即购买、分期购买，或直接放弃。若当前生活费不够立即付款，仍可选择分期。')
h2('立即购买与分期')
para('立即购买会一次性扣除全价。分期购买会在购买当周扣除第一期，之后每个教学周扣除一期；分期遇到假期暂停，生活费不足时扣到 0 并暂停，下周继续尝试。收益在购买后立即生效，不会因为分期未付完而失效。')
table(['购买方式', '适合', '注意'], [
    ['立即购买', '生活费充足、想尽快拿到收益', '一次性扣除全价，后续没有扣款'],
    ['分期购买', '当前现金不足、收益长期有效', '首期立即扣除；后续按周扣；假期暂停'],
], widths=[3.8, 6.4, 5.8])
h2('收益持续时间')
para('消费收益分为永久、本学年、本学期和一次性四类。永久效果持续整局；本学年效果到本学年结束，下一学年可以重新购买；本学期效果只到当前学期结束；一次性效果在购买时立即结算（例如购物节、演唱会）。')
para('每日效果只在非考试周、非假期生效，并从购买后的下一天开始；每周效果包含考试周但不包含假期。已购买且仍在生效的商品会从消费事件池中排除，不会重复弹出。')
h2('值得优先考虑的类型')
bullet('长期降低压力：新手机、人体工学椅、护眼台灯、按摩仪等，每天结算，越早买越划算。')
bullet('提升学习效率：降噪耳机、辅导书、教材、打印机、网课会员；它们分别影响图书馆、考试复习和每日准备度。')
bullet('关系与生活便利：电影购票优惠卡、网吧年卡、早餐年卡、外卖年度会员；适合有明确关系或作息计划的人。')
bullet('解锁内容：露营装备会永久解锁「去露营」单独邀约事件，三种羁绊都能抽到。')
callout('分期不是免费', '分期只是把付款推迟，不是打折。24 期 × 250 元的总价高于立即购买的手机；买之前先看总价和剩余学年。', PAPER_2, RED)

# ============================================================
# 12 EVENTS/CRISIS
# ============================================================
chapter_break()
h1('随机事件与压力危机', '12  /  WHAT THE WEEK BRINGS')
para('除了你主动安排的行动，每周还会有一些事情发生。它们不取代你的选择，但会改变你下一周的资源。', 'Guide Lead')
h2('随机事件')
para('随机事件包括完全随机、场景触发、属性触发和消费型事件。它们会在学期周中判定；同一条事件不会重复出现，每周最多触发一条普通事件。事件可能带来精力、压力、生活费、课程准备度、属性成长、关系或科研变化。')
para('一些事件需要特定条件才会出现：有导师、加入组织、进入实验室、某项属性达到阈值，或已经进入临床阶段。临床相关事件会在临床前课程结束后才进入随机池，避免大一就出现病房内容。')
h2('事件不是惩罚')
para('大多数事件没有“正确选项”，只有不同的资源交换。看到事件时，先判断它消耗的是你当前最不缺的资源，还是最缺的资源。压力高的时候，一个看似有趣的事件也可能成为最后一根稻草。')
h2('压力危机')
para('压力 ≥80 会碎一颗心，并触发一次干预。第三次碎心后，如果新的一周压力仍 ≥80，会进入六种压力结局之一。游戏会在碎心弹窗中提示当前心力规则；这不是装饰文本，请认真对待。')
para('如果家人好感足够高，压力危机前可能触发一次家人谈话并清空压力。这是最后的保险，不要把它当成常规降压手段。')

# ============================================================
# 13 UI
# ============================================================
chapter_break()
h1('界面、设置与存档', '13  /  HOW TO READ THE SCREEN')
h2('主界面')
para('电脑端主界面分为三栏：左侧人物档案与状态，中间本周安排，右侧手记与校园通知。手机端改为顶部状态 HUD、可切换完整/极简的行动区、单列行动卡和底部导航；左右滑动可以切换「状态 / 本周 / 通知」。')
h2('手机端本周页')
para('手机端「本周」页现在使用内部纵向滚动：页面顶部提供一条细滚动提示，标题与本周概览会随滚动淡出并收成当前时间吸顶条；点击吸顶条可以恢复完整标题。手机端不再显示 21 格时间段方块条，当前时间仍保留在时段徽标或吸顶条中。')
para('每日行动改为「每日行动」标题与三张卡片同一行，只显示图标、名称和状态。精力与压力的数字移到标签右侧，并在下方显示进度条，方便在手机上快速判断状态。')
para('自由行动卡提供「全部 / 生活 / 学习 / 社交」分类页签。科研归入「学习」；兼职、运动、睡懒觉和躺平归入「生活」；组织活动、单独邀约和组局归入「社交」。')
h2('手机端极简模式')
para('在手机「本周」页点击底部「主界面·完整」即可切换到极简模式，按钮变为「主界面·极简」；再次点击恢复完整模式。模式会保存在本地，从其他页面点击主界面只会回到本周，不会误切模式。')
para('极简模式隐藏章节标题、本周概览、分类页签、退选窗口和本周主攻等次要模块，只保留吸顶时间、每日行动和自由行动卡。行动卡接近正方形，标准手机为 4 列，屏幕宽度不超过 370px 时为 3 列；卡片只显示漫画插图、名称和锁定/已选/完成角标，锁定卡自动灰度。极限小屏仍保留少量滚动兜底。')
para('「小组作业 / 选修课程」在极简模式下缩写为「小组作业」。极简行动卡名称不再使用白色渐变底，名称直接叠在插图上；每日行动内部名称同样保持透明。')
h2('行动卡流动渐变')
para('完整和极简模式的自由行动卡共用一张整体渐变层：渐变按所有卡片覆盖的区域裁切，因此颜色会连续流过整组卡片，而卡片之间的缝隙仍然透明。渐变以 8 秒为一个周期缓慢流动，色系跟随当前时间段：上午暖金、下午松绿、晚上紫色。开启系统「减少动态效果」时会停止动画。')
h2('底部导航')
para('主界面、假期页和关系页底部有「我是谁 / 主界面 / TA 是谁」导航。学期计划页和选修选择页没有底部导航，以免误触。手机端底部导航固定在全画布底部。')
h2('解释说明开关')
para('右上角有解释说明总开关。开启后，页面导语、卡片描述、规则提示和数值变化可以分别开关。关闭说明后，文字会收起为粗体「i」按钮：电脑悬停查看，手机点击查看。关闭解释时，页面会保留最大的三档字号，并把较小文字放大 2–3px，保证可读性。')
h2('画布比例')
para('电脑端可以在保存进度旁切换自适应、16:10、3:2、4:3 画布比例。窄比例下自由行动卡会减少列数、加宽卡片。选择会保存在本地。')
h2('存档')
para('游戏使用浏览器 localStorage 自动保存，也可以手动保存。清理浏览器站点数据、使用无痕模式或换设备会导致存档丢失。本版使用 v45 存档结构，旧版 v44 及更早存档会在启动时清除；新玩家只能创建新存档。')

# ============================================================
# 14 FIRST YEAR
# ============================================================
chapter_break()
h1('第一学年建议路线', '14  /  A FIRST-YEAR ROUTE')
para('以下不是最优解，只是一条能让你安全理解系统、又不会把第一年玩崩的参考路线。', 'Guide Lead')
h2('开局选择')
bullet('资质：第一次游玩选择「出色」或「精英」，属性点更宽裕。')
bullet('属性：记忆力/悟性至少一项偏高；人际和抗压不要压到 2；体质影响体测，建议 5 以上。')
bullet('背景：平民/小康更接近“需要规划生活费”的体验；名门更轻松，但少一点资源压力。')
bullet('天赋：选一个你愿意围绕它安排的，例如英语、社交、精力或考试容错。')
h2('第一学期计划')
table(['项目', '建议', '理由'], [
    ['学习计划', 'A 稳扎稳打或 B 周期回顾', '第一学期先建立准备度，不急着用 C 赌考试'],
    ['习惯', '早睡 + 健身 / 散步 / 时间管理', '同时照顾精力、压力和准备度'],
    ['选修', '1–2 门，优先水课/兴趣课', '不要在第一学期塞满小组作业课'],
    ['每日行动', '精力低时喝咖啡；压力高时高碳日', '每日行动不占时间段'],
    ['自由行动', '图书馆为主，穿插运动/躺平', '先保证课程准备度'],
], widths=[3.2, 7.0, 5.6])
h2('第一周怎么过')
numbered('先看课表：哪几天有早课，哪些下午/晚上是空的。')
numbered('每天早上先处理课程；有课尽量去上，别在第一周就翘课。')
numbered('空时间段优先安排一次图书馆；第二次看精力，低于 40 就改为躺平或运动。')
numbered('每天用一次咖啡或高碳日，把精力/压力拉回安全区。')
numbered('睡前检查：精力是否 ≥40，压力是否 ≤60，下周是否有考试。')
numbered('每周至少拍一拍一次重要关系；不需要第一周就邀约。')
h2('第一学期考试周')
para('第一次考试周不要追求全科高分。先确保没有挂科，再考虑拉高优势科目。如果某门课准备度明显落后，使用「主攻一门」；如果整体平均，使用「均衡复习」。精力低于 30 时，休息比硬复习更划算。')
h2('第一学年结束前')
para('检查四件事：有没有挂科、CET 报名是否错过、奖学金综测是否太低、关系是否完全没动。只要这四件事没有同时出问题，第一年就是成功的。')

# ============================================================
# 15 FAQ
# ============================================================
chapter_break()
h1('常见问题', '15  /  FAQ')
faqs = [
    ('我可以不按推荐路线玩吗？', '可以。推荐路线只是降低第一次游玩的学习成本；你可以选择低资质、低生活费、完全不社交，或把五年都投入科研。游戏不会因为你“偏离主线”而惩罚你。'),
    ('为什么我的行动变灰了？', '常见原因：精力不足、生活费不足、没有导师/实验室/组织、当前时间段已有课程或活动、行动次数已用完。把鼠标移到卡片上通常能看到原因。'),
    ('翘课值得吗？', '翘课能换来一个自由时间段，但有被点名、扣平时分的风险。前期课程准备度低时，翘课的机会成本很高；后期如果准备度充足，可以用翘课换取关键社交或科研时间。'),
    ('为什么生活费一直在掉？', '学期内每天有固定生活费扣除，界面只显示当前档位；行动、社交、约会和消费事件还会额外扣钱。假期在家不扣固定开销。'),
    ('为什么习惯没有生效？', '习惯只在工作日结算，考试周和假期不触发；压力超过 60 时习惯失效。检查本周压力和你选择的习惯。'),
    ('亲密度怎么涨？', '拍一拍、聚餐、生日礼物、单独邀约、事件和舍友每周自动加成都会提高亲密度。只靠拍一拍很慢，重要关系需要主动安排时间。'),
    ('为什么单独邀约被拒绝？', '成功率由亲密度决定，基础公式为 25% + 亲密度 × 0.75%。被拒后本时间段不能重复邀约，但可以换个时间段再试。'),
    ('为什么消费事件的收益消失了？', '本学年/本学期收益会到期；每日效果在考试周和假期不结算；如果你购买了新一学年的同款商品，旧记录不会叠加。'),
    ('挂科了还能毕业吗？', '可以。挂科会在下一学期出现补考；补考通过后学分只算一次。但挂科会永久锁定国奖，并取消当年省奖。'),
    ('CET-6 必须 550 吗？', '毕业要求是 CET-6 ≥ 550。CET-4 通过后才能报考 CET-6；CET-6 通过后可以继续刷分。'),
    ('三颗心碎了还有救吗？', '碎心后仍有干预机会，但第三次碎心后如果新一周压力仍 ≥80 会进入结局。看到心力提示时就应该降压，而不是继续赌。'),
    ('挂科之后会怎样？', '成绩单会弹出挂科报告；相关课程进入下一学期补考，并在计划、课表和成绩单里显示「补考」标签。补考通过后学分只算一次，最终绩点取原绩点与补考绩点的平均。'),
    ('多少学分会被退学？', '累计未通过的专业课与思政课学分 ≥ 20 分时，确认挂科报告后会进入退学结局。选修课挂科不计入这个累计。'),
    ('存档在哪？', '存档保存在当前浏览器的 localStorage。清理站点数据、换浏览器或无痕模式都会丢失；重要进度建议手动保存并保留同一个浏览器环境。'),
    ('为什么旧存档不见了？', '本版本更换了科研与邮箱状态结构，旧版本存档已被清除；新版第一次打开时只能创建新角色。'),
    ('导师怎么联系？', '在科研页查看导师名录和教师主页，阶段1时点击「邮件联系」。每周最多发一封；积极回复读完后进入阶段2，并会约定面谈。'),
]
for q, a in faqs:
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(7); p.paragraph_format.space_after = Pt(2)
    r = p.add_run('Q  ' + q); set_run_font(r, HEAD_FONT, 11, True, INK_2)
    p = doc.add_paragraph(style='Guide Body')
    p.paragraph_format.left_indent = Cm(0.45); p.paragraph_format.space_after = Pt(6)
    r = p.add_run('A  ' + a); set_run_font(r, BODY_FONT, 10.5, False, '2C2A26')

# ============================================================
# APPENDIX
# ============================================================
chapter_break()
h1('速查表', 'APPENDIX  /  ONE-PAGE CHEAT SHEET')
h2('关键数字')
table(['项目', '数值'], [
    ['总学分', '196（专业/临床157 + 体育测试10 + 体育课8 + 思政11 + 选修10）'],
    ['八维面板', '开局 2–10；游戏中上限 15；进度条红线为 10'],
    ['挂科退学线', '累计未通过的专业课 + 思政课学分 ≥ 20'],
    ['考前遗忘', '3 学分基础：A 0–3 / B 8–16 / C 15–25；按学分缩放'],
    ['毕业英语', 'CET-6 ≥ 550'],
    ['CET 通过线', '425 / 750'],
    ['每周时间段', '21（7 天 × 3 段）'],
    ['学期结构', '3 周行动 + 1 周考试'],
    ['习惯数量', '2 个；压力 > 60 时失效'],
    ['压力危险线', '60 习惯失效 / 70 备考 -10% / 80 碎心'],
    ['交心朋友上限', '最多 5 个同辈亲密度 ≥60；满 5 人后其余同辈最高 59'],
    ['普通周拍一拍', '每人 1 次，全周最多 3 次'],
    ['假期拍一拍', '共 5 次，不按周刷新'],
    ['单独邀约', '每人每时段 1 次；每周最多成功 2 次'],
    ['单独邀约成功率', '25% + 亲密度 × 0.75%'],
    ['组织数量', '最多同时 2 个'],
    ['组织晋升', '25 次 / 60 次活动门槛'],
    ['导师联系', '阶段1–6；每周最多1封自荐邮件；积极回复30%–70%'],
    ['面谈成功率', '悟性4/操作3/建模2/交际1 → 30%–100%'],
    ['八卦概率', '50% + 0.5×(P−S)，限制5%–80%'],
    ['八卦与回复', '每周每个羁绊对象1次；10段八卦库 + 30条回复库'],
    ['奖学金', '国奖 80 / 省奖 70 / 校奖 50 分线'],
], widths=[5.2, 10.6])
h2('一页纸流程')
para('新生报到 → 天赋 → 选修 → 计划/习惯 → 第 1–3 周（每段做决定）→ 考试周 → 成绩单 → 假期 → 下一学期 → 大四选择去向 → 大五毕业结算。')
h2('新手三条保命原则')
bullet('先看精力/压力，再决定行动。不要为了“多做一点”把下周的自己送进危机。')
bullet('考试周三周前开始堆准备度；C 计划不是不能选，但第一次游玩不建议拿硬课赌。')
bullet('关系需要主动维护，但不需要每周都约。拍一拍是低成本的开始。')
doc.add_page_break()
h2('写在最后')
para('这份说明能告诉你规则，但不能替你过完五年。你会做出一些后来觉得愚蠢的决定，也会在某个普通的晚上因为一句回复而高兴很久。只要这些选择是你自己做的，它们就属于这个角色。')
para('如果五年后你回头看，发现自己没有成为最优秀的那个学生，却成为了一个还愿意继续走下去的人，那也是一个很好的结局。')

# page number field in footer already. Save.
doc.core_properties.title = '临床五年 · 新玩家规则说明'
doc.core_properties.subject = '《临床五年》v0.60.0 新玩家规则说明'
doc.core_properties.author = '临床五年项目组'
doc.core_properties.comments = '面向第一次游玩《临床五年》的规则说明文档。'
doc.core_properties.category = '游戏规则说明'
doc.core_properties.keywords = '临床五年, 新玩家, 规则说明, 医学模拟'
out = '临床五年_新玩家规则说明_v0.60.0.docx'
doc.save(out)
print(out)

import os
from PIL import Image, ImageDraw, ImageFont

def draw_letter_spaced_text(draw, text, pos, font, fill, spacing=10, anchor="mm"):
    total_w = 0
    char_widths = []
    max_h = 0
    
    for ch in text:
        bbox = draw.textbbox((0, 0), ch, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        char_widths.append(w)
        if h > max_h:
            max_h = h
            
    total_w = sum(char_widths) + (len(text) - 1) * spacing
    
    start_x = pos[0] - total_w / 2 if 'm' in anchor else pos[0]
    start_y = pos[1] - max_h / 2 if 'm' in anchor else pos[1]
    
    cur_x = start_x
    for i, ch in enumerate(text):
        draw.text((cur_x, start_y), ch, font=font, fill=fill)
        cur_x += char_widths[i] + spacing

def create_header_type_logo(bg_type="dark", size=(1024, 1024), output_path="img/logo_square_wordmark.png"):
    """홈페이지 상단 헤더 로고와 100% 동일한 고급 세리프 워드마크 정사각형 로고"""
    width, height = size
    
    if bg_type == "dark":
        img = Image.new("RGBA", (width, height), (24, 23, 22, 255)) # 딥 차콜 #181716
        draw = ImageDraw.Draw(img)
        
        # 럭셔리 듀얼 골드/화이트 보더 라인
        inset = 56
        draw.rectangle([inset, inset, width - inset, height - inset], outline=(217, 119, 6, 90), width=2)
        draw.rectangle([inset + 10, inset + 10, width - inset - 10, height - inset - 10], outline=(255, 255, 255, 22), width=1)
        
        text_heestay = (255, 255, 255, 255)
        text_sub = (214, 211, 209, 230)
        accent_color = (217, 119, 6, 255)
        
    elif bg_type == "transparent":
        img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        text_heestay = (255, 255, 255, 255)
        text_sub = (220, 215, 210, 240)
        accent_color = (217, 119, 6, 255)

    # 폰트 사이즈 조정: 104px (양옆 여백 황금비율 확보)
    font_heestay = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 108)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 26)

    cx = width / 2
    cy = height / 2

    # 중앙 정렬: HEESTAY (y = cy - 42)
    draw_letter_spaced_text(draw, "HEESTAY", (cx, cy - 45), font=font_heestay, fill=text_heestay, spacing=24, anchor="mm")
    
    # 미니멀 앰버 악센트 디바이더
    line_y = cy + 24
    line_w = 200
    draw.line([(cx - line_w / 2, line_y), (cx + line_w / 2, line_y)], fill=(217, 119, 6, 140), width=1)
    # 중앙 앰버 다이아몬드 포인트
    draw.polygon([(cx, line_y - 4), (cx + 4, line_y), (cx, line_y + 4), (cx - 4, line_y)], fill=accent_color)
    
    # 서브타이틀: JEJU PRIVATE POOLVILLA (y = cy + 70)
    draw_letter_spaced_text(draw, "JEJU PRIVATE POOLVILLA", (cx, cy + 70), font=font_sub, fill=text_sub, spacing=14, anchor="mm")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", quality=100)
    print(f"Created: {output_path}")

def create_emblem_logo(bg_type="dark", size=(1024, 1024), output_path="img/logo_square_emblem.png"):
    """H 심볼 + 희 뱃지 + 워드마크가 결합된 럭셔리 엠블럼형 로고"""
    width, height = size
    
    img = Image.new("RGBA", (width, height), (24, 23, 22, 255))
    draw = ImageDraw.Draw(img)
    
    inset = 56
    draw.rectangle([inset, inset, width - inset, height - inset], outline=(217, 119, 6, 90), width=2)
    draw.rectangle([inset + 10, inset + 10, width - inset - 10, height - inset - 10], outline=(255, 255, 255, 22), width=1)
    
    text_primary = (255, 255, 255, 255)
    text_sub = (214, 211, 209, 230)
    accent_color = (217, 119, 6, 255)
    badge_bg = (217, 119, 6, 255)
    badge_text = (255, 255, 255, 255)
    divider_color = (217, 119, 6, 120)

    font_serif_huge = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 250)
    font_kr_badge = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 68)
    font_wordmark = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 88)
    font_sans_sub = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 24)

    cx = width / 2
    symbol_center_y = 320
    
    draw.text((cx - 18, symbol_center_y), "H", font=font_serif_huge, fill=text_primary, anchor="mm")
    
    badge_cx = cx + 86
    badge_cy = symbol_center_y - 82
    badge_r = 50
    draw.ellipse([badge_cx - badge_r, badge_cy - badge_r, badge_cx + badge_r, badge_cy + badge_r], fill=badge_bg)
    draw.text((badge_cx, badge_cy - 2), "희", font=font_kr_badge, fill=badge_text, anchor="mm")

    draw_letter_spaced_text(draw, "HEESTAY", (cx, 595), font=font_wordmark, fill=text_primary, spacing=20, anchor="mm")

    line_y = 665
    line_w = 220
    draw.line([(cx - line_w / 2, line_y), (cx + line_w / 2, line_y)], fill=divider_color, width=1)
    diamond_s = 5
    draw.polygon([(cx, line_y - diamond_s), (cx + diamond_s, line_y), (cx, line_y + diamond_s), (cx - diamond_s, line_y)], fill=accent_color)

    draw_letter_spaced_text(draw, "JEJU PRIVATE POOLVILLA", (cx, 715), font=font_sans_sub, fill=text_sub, spacing=12, anchor="mm")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", quality=100)
    print(f"Created: {output_path}")

if __name__ == "__main__":
    # 1. 메인 워드마크형 정사각형 로고 (홈페이지 헤더와 100% 동일)
    create_header_type_logo("dark", (1024, 1024), "img/logo_square.png")
    create_header_type_logo("dark", (1024, 1024), "img/logo_square_dark.png")
    create_header_type_logo("transparent", (1024, 1024), "img/logo_square_transparent.png")
    
    # 2. 엠블럼형 정사각형 로고 (H 심볼 + 희 뱃지 결합)
    create_emblem_logo("dark", (1024, 1024), "img/logo_square_emblem.png")

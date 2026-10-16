import os
import glob
import pypdfium2 as pdfium

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'test_output')
IMAGES_DIR = os.path.join(OUTPUT_DIR, 'images')
os.makedirs(IMAGES_DIR, exist_ok=True)

# Select key test PDFs to render to images for visual inspection:
# 1. TL-004 Reproduction
# 2. Section 8 Mandatory scenarios across all 4 templates:
#    - M1 (1 item, empty notes)
#    - M2 (3 items, 1-line note)
#    - M3 (5 items, short note)
#    - M4 (7 items, multiline desc)
#    - M5 (10 items, 5-line note)
#    - M6 (15 items, long notes)
#    - M7 (25 items, multipage)
#    - M8 (40 items, long desc + multiline notes)

selected_patterns = [
    'TL004_reproduction*.pdf',
    'M1_1item_emptyNotes*.pdf',
    'M2_3items_oneLineNote*.pdf',
    'M3_5items_shortNotes*.pdf',
    'M4_7items_multilineDesc*.pdf',
    'M5_10items_fiveLineNote*.pdf',
    'M6_15items_longNotes*.pdf',
    'M7_25items_multipage*.pdf',
    'M8_40items_longDesc_multilineNotes*.pdf'
]

pdf_files = []
for pat in selected_patterns:
    pdf_files.extend(glob.glob(os.path.join(OUTPUT_DIR, pat)))

print(f"Rendering {len(pdf_files)} selected PDF files to images in {IMAGES_DIR}...")

rendered_count = 0
for pdf_path in sorted(pdf_files):
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    try:
        pdf = pdfium.PdfDocument(pdf_path)
        for page_idx in range(len(pdf)):
            page = pdf[page_idx]
            image = page.render(scale=2.0).to_pil()
            img_filename = f"{base_name}_p{page_idx + 1}.png"
            img_path = os.path.join(IMAGES_DIR, img_filename)
            image.save(img_path)
            rendered_count += 1
        pdf.close()
    except Exception as e:
        print(f"Error rendering {pdf_path}: {e}")

print(f"Successfully rendered {rendered_count} page images!")

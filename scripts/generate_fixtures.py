import os
import zipfile
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures')
os.makedirs(FIXTURES_DIR, exist_ok=True)

# 1. GENERATE PPTX (Valid ZIP with standard PowerPoint XML structure)
def create_pptx():
    pptx_path = os.path.join(FIXTURES_DIR, 'lecture_systems.pptx')
    with zipfile.ZipFile(pptx_path, 'w', zipfile.ZIP_DEFLATED) as z:
        # [Content_Types].xml
        content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="xml" ContentType="application/xml"/>
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
    <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
    <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
    <Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>"""
        z.writestr('[Content_Types].xml', content_types)

        # Slide 1 XML: CAP Theorem
        slide1_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:cSld>
        <p:spTree>
            <p:sp>
                <p:txBody>
                    <a:p><a:r><a:t>CAP Theorem in Distributed Systems</a:t></a:r></a:p>
                    <a:p><a:r><a:t>A distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously.</a:t></a:r></a:p>
                    <a:p><a:r><a:t>Network partitions are inevitable in real-world distributed networks, forcing systems to choose between consistency and availability.</a:t></a:r></a:p>
                </p:txBody>
            </p:sp>
        </p:spTree>
    </p:cSld>
</p:sld>"""
        z.writestr('ppt/slides/slide1.xml', slide1_xml)

        # Slide 2 XML: Raft Consensus
        slide2_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:cSld>
        <p:spTree>
            <p:sp>
                <p:txBody>
                    <a:p><a:r><a:t>Raft Distributed Consensus Algorithm</a:t></a:r></a:p>
                    <a:p><a:r><a:t>Raft achieves consensus via leader election, log replication, and commitment safety across replicated state machines.</a:t></a:r></a:p>
                    <a:p><a:r><a:t>It decomposes consensus into independent subproblems to improve understandability and formal verification over Multi-Paxos.</a:t></a:r></a:p>
                </p:txBody>
            </p:sp>
        </p:spTree>
    </p:cSld>
</p:sld>"""
        z.writestr('ppt/slides/slide2.xml', slide2_xml)

        # Slide 3 XML: Eventual Consistency
        slide3_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:cSld>
        <p:spTree>
            <p:sp>
                <p:txBody>
                    <a:p><a:r><a:t>Eventual Consistency and CRDTs</a:t></a:r></a:p>
                    <a:p><a:r><a:t>Conflict-free Replicated Data Types (CRDTs) allow concurrent replicas to converge automatically without central coordination.</a:t></a:r></a:p>
                    <a:p><a:r><a:t>State-based and operation-based CRDTs ensure mathematical commutativity and idempotence during multi-master synchronization.</a:t></a:r></a:p>
                </p:txBody>
            </p:sp>
        </p:spTree>
    </p:cSld>
</p:sld>"""
        z.writestr('ppt/slides/slide3.xml', slide3_xml)

    print(f"Created PPTX: {pptx_path}")

# 2. GENERATE IMAGE (High-contrast presentation slide note PNG)
def create_image():
    img_path = os.path.join(FIXTURES_DIR, 'study_note_neural_nets.png')
    img = Image.new('RGB', (1000, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    lines = [
        "Backpropagation and Chain Rule",
        "Backpropagation computes the gradient of the loss function with respect",
        "to every weight parameter in a deep neural network.",
        "It applies the calculus chain rule recursively from the output layer",
        "backward through hidden layers to update synaptic weights efficiently."
    ]

    y = 60
    for i, line in enumerate(lines):
        # Draw simple crisp text
        draw.text((60, y), line, fill=(0, 0, 0))
        y += 60 if i == 0 else 45

    img.save(img_path)
    print(f"Created Image: {img_path}")

    # Also create non-textual image for edge-case test
    non_text_path = os.path.join(FIXTURES_DIR, 'diagram_no_text.png')
    blank_img = Image.new('RGB', (400, 400), color=(220, 220, 230))
    b_draw = ImageDraw.Draw(blank_img)
    b_draw.ellipse((80, 80, 320, 320), fill=(100, 150, 240), outline=(50, 80, 180), width=4)
    blank_img.save(non_text_path)
    print(f"Created Non-text Image: {non_text_path}")

# 3. GENERATE VIDEO (MP4 with slide frames and text drawn via OpenCV)
def create_video():
    video_path = os.path.join(FIXTURES_DIR, 'lecture_microservices.mp4')
    width, height = 960, 540
    fps = 10
    duration_sec = 4
    total_frames = fps * duration_sec

    # fourcc mp4v
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(video_path, fourcc, fps, (width, height))

    slides = [
        ("Microservices Architecture Patterns", "Independent deployment and horizontal scaling across decoupled business boundaries."),
        ("API Gateway and Reverse Proxies", "Centralizes authentication, rate limiting, and request routing for client applications.")
    ]

    for frame_idx in range(total_frames):
        slide_idx = 0 if frame_idx < total_frames // 2 else 1
        title, desc = slides[slide_idx]

        # White canvas
        frame = np.ones((height, width, 3), dtype=np.uint8) * 255

        # Draw dark border & background card
        cv2.rectangle(frame, (40, 40), (width - 40, height - 40), (245, 240, 235), -1)
        cv2.rectangle(frame, (40, 40), (width - 40, height - 40), (200, 180, 160), 2)

        # Title
        cv2.putText(frame, title, (70, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (40, 30, 20), 2, cv2.LINE_AA)
        
        # Description lines
        cv2.putText(frame, desc[:50], (70, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (70, 60, 50), 2, cv2.LINE_AA)
        cv2.putText(frame, desc[50:], (70, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (70, 60, 50), 2, cv2.LINE_AA)

        out.write(frame)

    out.release()
    print(f"Created Video: {video_path}")

# 4. GENERATE PDF (Real text layer PDF via pure Python PDF stream writer)
def create_pdf():
    pdf_path = os.path.join(FIXTURES_DIR, 'study_guide_algorithms.pdf')
    # Standard minimal PDF with text stream objects
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length 285 >>
stream
BT
/F1 18 Tf
50 720 Td
(Dynamic Programming and Optimal Substructure) Tj
/F1 12 Tf
0 -36 Td
(Dynamic programming solves complex problems by breaking them down into overlapping) Tj
0 -20 Td
(subproblems and storing intermediate solutions in a memoization table or 2D array.) Tj
0 -20 Td
(Optimal substructure ensures the global optimum can be constructed from local subproblems.) Tj
ET
endstream
endobj
7 0 obj
<< /Length 260 >>
stream
BT
/F1 18 Tf
50 720 Td
(Dijkstra Shortest Path Algorithm) Tj
/F1 12 Tf
0 -36 Td
(Finds the shortest paths between nodes in a graph with non-negative edge weights.) Tj
0 -20 Td
(Uses a priority queue min-heap to achieve O(|E| + |V| log |V|) asymptotic time complexity.) Tj
ET
endstream
endobj
xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000123 00000 n 
0000000244 00000 n 
0000000365 00000 n 
0000000438 00000 n 
0000000776 00000 n 
trailer
<< /Size 8 /Root 1 0 R >>
startxref
1088
%%EOF"""

    with open(pdf_path, 'wb') as f:
        f.write(pdf_content)
    print(f"Created PDF: {pdf_path}")

    # Corrupt PDF for error-handling test
    corrupt_pdf_path = os.path.join(FIXTURES_DIR, 'corrupt_test_file.pdf')
    with open(corrupt_pdf_path, 'wb') as f:
        f.write(b"NOT_A_VALID_PDF_RANDOM_GARBAGE_BYTES_12345")
    print(f"Created Corrupt File: {corrupt_pdf_path}")

if __name__ == '__main__':
    create_pptx()
    create_image()
    create_video()
    create_pdf()
    print("All fixtures generated successfully!")

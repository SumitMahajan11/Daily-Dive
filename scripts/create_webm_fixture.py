import os
import base64
from playwright.sync_api import sync_playwright

output_path = os.path.abspath('tests/fixtures/lecture_microservices.webm')

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    # Generate video using native browser MediaRecorder
    video_base64 = page.evaluate("""async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        
        const stream = canvas.captureStream(10);
        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
            ? 'video/webm;codecs=vp9' 
            : 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType: mime });
        const chunks = [];
        
        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        
        const finished = new Promise((resolve) => {
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const b64 = reader.result.split(',')[1];
                    resolve(b64);
                };
                reader.readAsDataURL(blob);
            };
        });
        
        recorder.start();
        
        // Slide 1
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('Microservices Architecture Patterns', 50, 90);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('Decoupled business capabilities and horizontal scaling.', 50, 160);
        ctx.fillText('Services communicate via asynchronous event buses.', 50, 200);
        
        await new Promise(r => setTimeout(r, 1200));
        
        // Slide 2
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('API Gateway and Reverse Proxy', 50, 90);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('Centralized TLS termination, rate limiting, and auth.', 50, 160);
        ctx.fillText('Routes ingress requests to downstream microservices.', 50, 200);
        
        await new Promise(r => setTimeout(r, 1200));
        
        recorder.stop();
        return await finished;
    }""")
    
    with open(output_path, 'wb') as f:
        f.write(base64.b64decode(video_base64))
        
    print(f"Created authentic WebM presentation video: {output_path} ({os.path.getsize(output_path)} bytes)")
    browser.close()

import os
import base64
from playwright.sync_api import sync_playwright

output_path = os.path.abspath('tests/fixtures/lecture_microservices.webm')

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    video_base64 = page.evaluate("""async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext('2d');
        
        const stream = canvas.captureStream(20);
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
        
        // Helper to draw clean presentation slide
        function drawSlide(title, bullets) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Header accent bar
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(60, 45, 60, 6);
            
            // Title
            ctx.font = 'bold 32px sans-serif';
            ctx.fillStyle = '#f8fafc';
            ctx.fillText(title, 60, 95);
            
            // Bullets
            ctx.font = '20px sans-serif';
            ctx.fillStyle = '#94a3b8';
            bullets.forEach((b, idx) => {
                ctx.fillText('• ' + b, 60, 160 + idx * 55);
            });
        }
        
        // Continuously animate canvas so captureStream generates frames reliably
        let currentSlide = 1;
        const timer = setInterval(() => {
            if (currentSlide === 1) {
                drawSlide('Microservices Architecture Patterns', [
                    'Decomposes monolithic systems into independently deployable domain services.',
                    'Each microservice owns a dedicated isolated database to enforce autonomy.',
                    'Enables horizontal scaling and continuous deployment across fault domains.'
                ]);
            } else if (currentSlide === 2) {
                drawSlide('API Gateway Routing & Security', [
                    'Centralizes reverse proxy routing, rate limiting, and TLS termination.',
                    'Shields internal service mesh network topologies from public clients.',
                    'Aggregates granular microservice payloads into unified client responses.'
                ]);
            } else if (currentSlide === 3) {
                drawSlide('Draft Latency Benchmarks,', [
                    'Preliminary load tests indicate p99 latency spikes under unpartitioned queue backpressure,',
                    'Requires partitioned topic partitions and distributed consumer group scaling.'
                ]);
            }
        }, 100);

        recorder.start(500);
        
        // Slide 1: 0 - 2.5s
        await new Promise(r => setTimeout(r, 2500));
        
        // Slide 2: 2.5 - 5.0s
        currentSlide = 2;
        await new Promise(r => setTimeout(r, 2500));
        
        // Slide 3: 5.0 - 7.5s
        currentSlide = 3;
        await new Promise(r => setTimeout(r, 2500));
        
        clearInterval(timer);
        recorder.requestData();
        await new Promise(r => setTimeout(r, 300));
        recorder.stop();
        
        return await finished;
    }""")
    
    with open(output_path, 'wb') as f:
        f.write(base64.b64decode(video_base64))
        
    print(f"Generated realistic multi-slide WebM lecture video: {output_path} ({os.path.getsize(output_path)} bytes)")
    browser.close()

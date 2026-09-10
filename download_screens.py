import urllib.request
import os

screens = [
    {
        "name": "category-tree-filter",
        "title": "Category Tree Filter",
        "screen_id": "838f298e0a1e47088dfd452e6cc076f8",
        "img_url": "https://lh3.googleusercontent.com/aida/AEtjO1U-1UCkr1w8wANc7e5Qq-goXhdoXhffXv87Q65CFBjB1rm0ugFfnJnliY4Z07jbgTLy12CWo9RqixMeh9Eb2sHml6hTWzdA0Z_EM7oMlk8kcTliDvWLdSmYw9Q6bAk8sCrNMVEbecZljpPSn2VZidUTl5x4Dk745zPTnT0WL3Jz8kHAKElg0wIoYIAiLB684QFMpTho6sHR9UxJW_P9k_OwpcPkliA_H76n2jPgnU7SdTGQlHKmEVg2Sf4",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YjEwYjY5N2U1MTIwMjA3Yjg5ODg1MzAzNWFmEgsSBxCvgJGAlRAYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTAwMzU3MDczMzgxNjI1MzI1&filename=&opi=89354086"
    },
    {
        "name": "progress-and-stats",
        "title": "Progress & Stats",
        "screen_id": "6f6829ea99f54f7d887b131f85264418",
        "img_url": "https://lh3.googleusercontent.com/aida/AEtjO1WIpDA3_VWhG2hcmO3bkQg7O8jZ1QhAcWjQ93HAfIiSIWsTz-dz_XaQmM_lrJrtfTcKfh2UeJS4vTfqgpGlXnHArDYgEIABnxewOmQRa2vSqy8xiIo77hmqInFKSMcfn8tOEjN_798hdTYAhW7Ue5j34oE026uVb_Ozr6pz7QbDGc7vIfyZ_HilnBEtxp4uEpMsGDvNNe4R9Dmll0w_j1HvzaMB-2cmiK6xMw_AsbDw_O816pxPTgzly6M",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YjEwYzJjY2Y4YTAwN2M0Y2FkZWVkMmM1ZTkxEgsSBxCvgJGAlRAYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTAwMzU3MDczMzgxNjI1MzI1&filename=&opi=89354086"
    },
    {
        "name": "spin-roulette",
        "title": "Spin Roulette",
        "screen_id": "9cd5c071a0bf47799e5736d0f4b3adc9",
        "img_url": "https://lh3.googleusercontent.com/aida/AEtjO1XGc4CsNBMVAUI4Fylld4fRFp0eSrKS8UmEwPKR31bGC7tLpI9pFNyLVGNp114OzMKlw848qh8aqbyGF5HtkUk9iMqQytMcaUfEOUEtns8mHII4UgDyFlJQGs30vH-IDHnNLIvXdHjNxlR8b_uMmtpphLjKvjM1U9y5ZhoHZ22pikG6PdZ3i6lqY8Sip6EuPN4i7QxPHprk4mQxdT9zb1a85uxNr1xZhVNqINWmo6VJaskguoZCJ6AkQA",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YjEwYmFhZmJhOGIwMWVlN2ViMmFmMjgwMTE2EgsSBxCvgJGAlRAYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTAwMzU3MDczMzgxNjI1MzI1&filename=&opi=89354086"
    },
    {
        "name": "settings-and-preferences",
        "title": "Settings & Preferences",
        "screen_id": "e18d9437c8e24da9ab00bd029486f29a",
        "img_url": "https://lh3.googleusercontent.com/aida/AEtjO1XnXMDdllNdDcRA3VpEEcRwDr47aY6RsKaYWtMQxAagMSYVhj4GIoyzKSk96J3OO7egGu7kzNI8pWdUiaTV1yphM95YHIj3_5WCg-Y9m6w9PLke-b7AV3J4doLcqFWUUvTEf5UO1-vRSRbHbht3ca-8FpfeaJ93_WAR-uQKLQLHb0Ffp2eGoryxVmusLPaWnQJJgTBbll2HP53cB7YUFaCDpOa_QeMxYm8epLUWMchRWwyTaGg8Oh-HMw",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YjEwYzJiNjg5ODMwN2M0ZThkZDNiMTk0NDQ5EgsSBxCvgJGAlRAYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTAwMzU3MDczMzgxNjI1MzI1&filename=&opi=89354086"
    }
]

headers = {'User-Agent': 'Mozilla/5.0'}

for screen in screens:
    name = screen['name']
    print(f"Downloading {name}...")
    
    # Download image
    img_req = urllib.request.Request(screen['img_url'], headers=headers)
    with urllib.request.urlopen(img_req) as response, open(f"{name}.png", 'wb') as out_file:
        out_file.write(response.read())
        
    # Download html
    html_req = urllib.request.Request(screen['html_url'], headers=headers)
    with urllib.request.urlopen(html_req) as response, open(f"{name}.html", 'wb') as out_file:
        out_file.write(response.read())

print("All downloads completed successfully!")

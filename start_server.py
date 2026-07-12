from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

PORT = 8765
ROOT = Path(__file__).resolve().parent

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

if __name__ == '__main__':
    url = f'http://localhost:{PORT}/index.html'
    print(f'Roadbook is running at {url}')
    print('Keep this terminal open while using the app. Press Ctrl+C to stop.')
    webbrowser.open(url)
    ThreadingHTTPServer(('localhost', PORT), Handler).serve_forever()

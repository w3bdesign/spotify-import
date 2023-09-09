from main import app
import hypercorn.asyncio

if __name__ == "__main__":
    hypercorn.asyncio.serve(app, hypercorn.Config())

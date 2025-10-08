# Use the official Python base image
FROM python:3.14

# Set the working directory
WORKDIR /app

# Copy requirements.txt into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app will run on
EXPOSE 5000

# Start the application using gunicorn
CMD ["gunicorn", "app.main:app", "-b", "0.0.0.0:5000", "--workers", "4", "--threads", "4"]
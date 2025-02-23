FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN pip3 install --upgrade pip
RUN pip3 install flask requests

EXPOSE 5000

CMD ["python3", "app.py"]

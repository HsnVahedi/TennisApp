FROM python:3.8.1-slim-buster as base
WORKDIR /app
EXPOSE 8000
RUN apt-get update --yes --quiet && apt-get install --yes --quiet --no-install-recommends \
    build-essential \
    libpq-dev \
    libmariadbclient-dev \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    libwebp-dev \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /
RUN pip install -r /requirements.txt

# Copy the pip-install script and make it executable
COPY pip-install.sh /usr/local/bin/pip-install
RUN chmod +x /usr/local/bin/pip-install

COPY . .

FROM base as dev
# Install git
RUN apt-get update
RUN apt-get install -y git
CMD ["tail", "-f", "/dev/null"]

FROM base as prod
CMD ["tail", "-f", "/dev/null"]

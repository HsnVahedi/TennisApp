FROM python:3.8.1-slim-buster as base
RUN apt-get update --yes --quiet && apt-get install --yes --quiet --no-install-recommends \
    build-essential \
    libpq-dev \
    libmariadbclient-dev \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    libwebp-dev \
    sudo \
 && rm -rf /var/lib/apt/lists/*
# Create a non-root user
RUN useradd -ms /bin/bash django
RUN echo 'django ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER django
WORKDIR /app/tennis
EXPOSE 8000
# Copy the pip-install script and make it executable
COPY --chown=django:django pip-install.sh /usr/local/bin/pip-install
RUN sudo chmod +x /usr/local/bin/pip-install
COPY --chown=django:django requirements.txt /
RUN pip install -r /requirements.txt
COPY --chown=django:django . .

FROM base as dev
USER django
WORKDIR /app/tennis
CMD ["tail", "-f", "/dev/null"]

FROM base as prod
USER django
CMD ["tail", "-f", "/dev/null"]

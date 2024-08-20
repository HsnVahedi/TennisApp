FROM python:3.8.1-slim-buster AS base
# TODO: Optimize package installation
RUN apt-get update --yes --quiet && apt-get install --yes --quiet --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    libgtk2.0-dev \
    libgtk-3-dev \
    sudo \
    && rm -rf /var/lib/apt/lists/*
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

FROM base AS dev
USER django
WORKDIR /app/tennis
CMD ["tail", "-f", "/dev/null"]

FROM base AS prod
USER django
CMD ["tail", "-f", "/dev/null"]

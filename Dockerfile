FROM node:10.16.2-alpine

ENV USER=node-user
ENV UID=12345
ENV GID=12345

WORKDIR /home/${USER}

RUN addgroup --gid "$GID" "$USER" \
    && adduser \
    --disabled-password \
    --gecos "" \
    --home "$(pwd)" \
    --ingroup "$USER" \
    --no-create-home \
    --uid "$UID" \
    "$USER"

USER ${USER}

COPY . .

CMD ["node", "index.js"]
OPENSSL_FLAGS = -newkey rsa:4096 -new -nodes -x509 -days 3650 -keyout https/key.pem -out https/cert.pem
OPENSSL_CMD = openssl req $(OPENSSL_FLAGS)

dev:
	node index.js

prod:
	NODE_ENV=production node index.js

create-keys:
	[ -d ./https ] || mkdir ./https
	$(OPENSSL_CMD)

create-dirs:
	[ -d ./.data/users ] || mkdir -p ./.data/users
	[ -d ./.data/tokens ] || mkdir -p ./.data/tokens

setup: create-key create-dirs

dev:
	node index.js

prod:
	NODE_ENV=production node index.js

create-keys:
	openssl req -newkey rsa:4096 -new -node -x509 -days 3650 -keyout key.pem -out cert.pem

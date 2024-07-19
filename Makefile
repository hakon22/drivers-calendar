install:
	npm ci

start:
	pm2 start "npm run start" -n drivers

start-local:
	npm run dev

start-local-prod:
	npm run dev-prod

build:
	pm2 delete drivers && rm -rf .next && NODE_OPTIONS=--max-old-space-size=8192 npm run build
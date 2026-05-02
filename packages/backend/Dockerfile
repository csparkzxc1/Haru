# 멀티스테이지 빌드 — Render Free / Fly.io 모두에서 사용.
#
# 의도:
#   - 워크스페이스 전체를 빌드 컨텍스트로 받지만 최종 이미지에는 backend
#     런타임만 남긴다.
#   - Prisma client 는 런타임에 필요하므로 함께 패키징.
#   - 시크릿(.env) 은 절대 빌드 컨텍스트에 포함되지 않도록 .dockerignore 사용.

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

# ----- deps: 워크스페이스 의존성 설치 (캐시 친화적) -----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --frozen-lockfile --filter @haru/backend...

# ----- build: 컴파일 -----
FROM deps AS build
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend
RUN pnpm --filter @haru/backend exec prisma generate
RUN pnpm --filter @haru/backend build

# ----- runtime: 최소 이미지 -----
FROM node:20-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /repo/pnpm-lock.yaml /repo/pnpm-workspace.yaml /repo/package.json ./
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/packages/backend ./packages/backend
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/backend/node_modules ./packages/backend/node_modules

EXPOSE 3001

# 컨테이너 시작 시 prisma migrate deploy 를 자동 실행한다.
# Render의 first-start hook 보다 컨테이너 자체가 책임지는 편이 안전.
CMD ["sh", "-c", "pnpm --filter @haru/backend exec prisma migrate deploy && pnpm --filter @haru/backend start"]

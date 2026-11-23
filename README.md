# Chess

Browser chess game with a serverless AWS backend that saves each signed-in user's game state.

- **Frontend:** Vite + TypeScript, drag-and-drop board, piece icons from Font Awesome Free (stored locally).
- **Backend:** AWS CDK (Python). One stack, `ChessStack`, holds everything:
  S3 + CloudFront (site), Cognito (auth), API Gateway HTTP API, Lambda (Python 3.12), DynamoDB (game state).

The game does not include check detection, checkmate, move highlighting or pawn promotion.

## Repo layout

```
frontend/              Vite + TypeScript app
  src/main.ts          board, move validation, turn handling
  src/pieces.ts        piece markup, imports SVGs from src/assets/pieces/
  src/config.ts        API / Cognito settings read from VITE_* env vars
  public/              static files copied as-is
backend/               CDK app
  app.py               CDK entry point
  stacks/chess_stack.py  all AWS resources
  lambda/handler.py    GET / PUT / DELETE /game
.github/workflows/     deploy-frontend.yml, deploy-backend.yml
```

## Prerequisites

- Node 22 or 24 and npm
- Python 3.12+
- AWS CLI with credentials (only for deploying or inspecting the stack)
- AWS CDK CLI: `npm install -g aws-cdk@2`

## Frontend: run locally

```bash
cd frontend
npm install        # first time
npm run dev        # http://localhost:5173
```

- `npm run build` typechecks (`tsc`) and writes `dist/`.
- `npm run preview` serves the production build.
- The game itself runs client-side and needs no backend yet.

To point the dev server at a deployed backend, create `frontend/.env.local` (gitignored) with the stack outputs:

```
VITE_API_URL=...
VITE_USER_POOL_ID=...
VITE_USER_POOL_CLIENT_ID=...
```

These values are public identifiers, not secrets: they end up in the browser bundle by design.
Access is enforced server-side by the Cognito JWT authorizer. Never put real secrets in a `VITE_*` variable.

## Backend: work on it

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cdk synth          # validates the stack, no AWS calls needed
cdk diff           # compare with the deployed stack
```

- `cdk deploy` and `cdk diff` need AWS credentials for the account.
- The account must be bootstrapped once: `cdk bootstrap aws://<account>/us-east-1`.
- Lambda code lives in `backend/lambda/` and is packaged by CDK. Environment variables (e.g. `TABLE_NAME`) are set in `chess_stack.py`.
- The API requires a Cognito JWT. An unauthenticated call to `/game` should return `401`.

## Deployment

Both workflows run on push to `main` and authenticate to AWS with GitHub OIDC (no stored keys).

| Workflow | Trigger paths | What it does |
|---|---|---|
| `deploy-backend.yml` | `backend/**` | `cdk synth`, then `cdk deploy` for `ChessStack` |
| `deploy-frontend.yml` | `frontend/**` | reads stack outputs, builds with them, syncs `dist/` to the site bucket, invalidates CloudFront |

Notes:

- CDK does not manage the site files. The frontend workflow owns the bucket contents, so a backend deploy never touches them.
- The frontend workflow fails with a clear message if `ChessStack` is missing an output. Deploy the backend first on a fresh account.
- A change to the API URL or Cognito IDs needs a frontend rebuild, so re-run the frontend workflow after such a backend change.
- The stack outputs `SiteUrl`, `ApiUrl`, `UserPoolId`, `UserPoolClientId`, `SiteBucketName`, `DistributionId` and `TableName`:
  `aws cloudformation describe-stacks --stack-name ChessStack --query "Stacks[0].Outputs"`
- Bucket, table and user pool use `RETAIN`. Deleting the stack leaves them behind.

## Contributing

1. Branch from `main`.
2. Keep frontend and backend changes in separate commits where possible, since each triggers its own workflow.
3. Before opening a PR, run `npm run build` in `frontend/` and `cdk synth` in `backend/`.
4. Keep commits small with a short imperative subject (e.g. `Add login page`).
5. Open a PR to `main`. Merging deploys.

## Credits

Chess piece icons: [Font Awesome Free](https://fontawesome.com) 6.4.0, CC BY 4.0.
Original game by Sahil Makadia ([Simple-Chess-Using-Javascript](https://github.com/sahilm2063/Simple-Chess-Using-Javascript)).

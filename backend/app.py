#!/usr/bin/env python3
import aws_cdk as cdk

from stacks.chess_stack import ChessStack

app = cdk.App()
ChessStack(
    app,
    "ChessStack",
    env=cdk.Environment(account="620339869704", region="us-east-1"),
)
app.synth()

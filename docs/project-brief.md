# Project Brief

## Overview

DSASign is a web application for generating ElGamal/DSA-style key pairs, signing documents, and verifying signatures in the browser-driven workflow used by the signer and verifier roles described in the project brief.

## Core Users

- Signer: creates a key pair, signs a document, and shares the signed package.
- Verifier: receives a document, signature, and public key, then checks whether the signature matches the document hash.

## Core Verb

The product verb is to move a document through a chain of custody: generate keys, seal a document with a signature, and confirm whether the seal still matches the document.

## Constraints

- The app is built with Next.js App Router and TypeScript.
- Cryptographic operations run on the server side.
- The UI must support file upload flows for signing and verification.
- The project is educational, so the UI must expose steps and intermediate values clearly.
- No persistent database is required for the current scope.

## Non-Goals

- Multi-user accounts and authentication.
- Long-term storage of private keys or uploaded documents.
- Distributed services or queue-based processing.

## Success Criteria

- A user can generate a public/private key pair.
- A user can sign a document and download or copy the resulting signature payload.
- A verifier can upload the document, signature, and public key and get a valid or invalid result with a clear explanation.

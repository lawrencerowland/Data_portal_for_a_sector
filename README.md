[![banner](https://github.com/deltaDAO/files/raw/main/github_banner.png)](https://portal.minimal-gaia-x.eu)

<h1 align="center">Minimal Gaia-X Portal</h1>

## 🏄 Get Started

The MVG portal demonstrator is built on top of [Ocean Market](https://github.com/oceanprotocol/market), an Open Source React app utilizing DLT, built by @oceanprotocol. For details on code structure, design principles and more, please head over to the repository located at https://github.com/oceanprotocol/market.

The app is a React app built with [Gatsby.js](https://www.gatsbyjs.org) + TypeScript + CSS modules and will connect to Ocean remote components hosted by [deltaDAO](https://delta-dao.com) by default.

To start local development:

```bash
git clone https://github.com/deltaDAO/mvg-portal
cd mvg-portal

# when using nvm to manage Node.js versions
nvm use

npm install
npm start
```

This will start the development server under
`http://localhost:8000`.

To explore the generated GraphQL data structure fire up the accompanying GraphiQL IDE under
`http://localhost:8000/__graphql`.

## 🧊 Important Components

This portal uses Ocean Protocol under the hood. There are multiple Ocean components at work, for mor information please head to the [Ocean Market repository](https://github.com/oceanprotocol/market). To get a brief overview of important components at use in the MVG context let's have a look at some of them:

### Environment variables

The `app.config.js` file is setup to prioritize environment variables for setting each Ocean component endpoint. By setting environment variables, you can easily switch between Ocean networks the app connects to, without directly modifying `app.config.js`.

For local development, you can use a `.env` file:

```bash
# modify env variables, Rinkeby is enabled by default when using those files
cp .env.example .env
```

### Network Metadata

All displayed chain & network metadata is retrieved from `https://chainid.network` on build time and integrated into Gatsby's GraphQL layer. This data source is a community-maintained GitHub repository under [ethereum-lists/chains](https://github.com/ethereum-lists/chains).

Since the Gaia-X Test Network is in it's early stages, this network is not yet added to the above mentioned repository. The Gaia-X network is added to the `ethereum-chain-list` during build time and can be accessed just like any other chain would within Ocean Market. If you want to overwrite some default configurations like the metadata cache or provider URIs you can do this comfortably in the `chains.config.js` file.

### Lifecycle Management

To showcase how data lifecycle management may work in the context of Gaia-X we provide a dedicated [Self Description Lifecycle Management repository](https://github.com/deltaDAO/Self-Description-Lifecycle-Management). It is possible to change the current lifecycle of an asset by simply adding to this repository. For more information head over to https://github.com/deltaDAO/Self-Description-Lifecycle-Management.

## ⬆️ Deployment

This repository is automatically deployed via [Netlify](https://netlify.com).

The latest deployment of the `main` branch is automatically aliased to `portal.minimal-gaia-x.eu`, where the deployment on Netlify is the current live deployment.

## 🍴 Forking

We encourage you to fork this repository and create your own Minimal Viable Gaia-X portal. When you publish your forked version of this portal there are a few elements that you are required to change for copyright reasons:

- The Gaia-X logo is a trademark of the Gaia-X AISBL and must be removed from forked versions of the portal.
- The deltaDAO logo is a trademark of deltaDAO AG and must be removed from forked versions of the portal.

Additionally, we would also advise that your retain the text saying "Powered by Ocean Protocol" on your forked version of this portal in order to give credit for the development work done by the Ocean Protocol team.

Everything else is made open according to the Apache-2.0 license. We look forward to seeing your MVG portal!

## 🏛 License

```text
Copyright 2021 Ocean Protocol Foundation Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

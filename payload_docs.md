### Minimum Payload CMS Configuration

Source: https://payloadcms.com/docs/getting-started/installation



Demonstrates a basic `payload.config.ts` file, including imports for `sharp`, `@payloadcms/richtext-lexical`, `@payloadcms/db-mongodb`, and `buildConfig`. It shows how to set up the editor, collections, secret, database adapter (Mongoose example), and sharp for image processing.

```TypeScript
import sharp from 'sharp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'

export default buildConfig({
// If you'd like to use Rich Text, pass your editor here
editor: lexicalEditor(),

// Define and configure your collections in this array
collections: [],

// Your Payload secret - should be a complex and secure string, unguessable
secret: process.env.PAYLOAD_SECRET || '',
// Whichever Database Adapter you're using should go here
// Mongoose is shown as an example, but you can also use Postgres
db: mongooseAdapter({
url: process.env.DATABASE_URI || '',
}),
// If you want to resize images, crop, set focal point, etc.
// make sure to install it and pass it to the config.
// This is optional - if you don't need to do these things,
// you don't need it!
sharp,
})
```

--------------------------------

### Create Payload App from Example

Source: https://payloadcms.com/docs/examples/overview

This command-line interface (CLI) command allows users to quickly scaffold a new Payload project based on an existing example. It utilizes `npx` to execute the `create-payload-app` package without global installation. Replace `example_name` with the specific example you wish to use from the available list.

```Shell
npx create-payload-app --example example_name
```

--------------------------------

### Initialize Payload Website Project

Source: https://payloadcms.com/docs/getting-started/what-is-payload

This command uses `npx` to scaffold a new Payload application, specifically pre-configured with the official website template. It's the quickest way to get started with Payload for content management.

```Shell
npx create-payload-app@latest -t website
```

--------------------------------

### Install Core Payload Packages

Source: https://payloadcms.com/docs/getting-started/installation

Install the essential Payload CMS packages and their dependencies, including `@payloadcms/next`, `@payloadcms/richtext-lexical`, `sharp`, and `graphql`. This command uses `pnpm` but can be adapted for other package managers like `npm` (potentially with `--legacy-peer-deps`).

```Shell
pnpm i payload @payloadcms/next @payloadcms/richtext-lexical sharp graphql
```

--------------------------------

### Install Payload Database Adapters

Source: https://payloadcms.com/docs/getting-started/installation

Payload requires a database adapter to establish a connection. Choose and install one of the following commands based on your preferred database: MongoDB, Postgres, or SQLite. New adapters are continuously being added.

```Shell
pnpm i @payloadcms/db-mongodb
```

```Shell
pnpm i @payloadcms/db-postgres
```

```Shell
pnpm i @payloadcms/db-sqlite
```

--------------------------------

### Scaffold New Payload App with create-payload-app

Source: https://payloadcms.com/docs/getting-started/installation

Use the `create-payload-app` command to quickly scaffold a new Payload application. This command sets up a new folder with a functioning Payload app, ready for further configuration.

```Shell
npx create-payload-app
```

--------------------------------

### TypeScript Configuration for Payload Config Path

Source: https://payloadcms.com/docs/getting-started/installation

Illustrates how to update `tsconfig.json` to include a path alias for the `payload.config.ts` file, allowing for easier imports within the project and improving module resolution.

```JSON
{
"compilerOptions": {
"paths": {
"@payload-config": ["./payload.config.ts"]
}
}
}
```

--------------------------------

### Install PayloadCMS Live Preview Base Package

Source: https://payloadcms.com/docs/live-preview/server

Instructions to install the base npm package for building custom live preview components, providing core utilities for communication with the Admin Panel.

```bash
npm install @payloadcms/live-preview
```

--------------------------------

### Install PayloadCMS Live Preview React Package

Source: https://payloadcms.com/docs/live-preview/server

Instructions to install the necessary npm package for integrating server-side live preview with React applications, specifically for Next.js App Router.

```bash
npm install @payloadcms/live-preview-react
```

--------------------------------

### Install Payload Live Preview Client Package

Source: https://payloadcms.com/docs/live-preview/client

This command installs the core `@payloadcms/live-preview` package, which provides the necessary functions for building client-side live preview integrations with Payload CMS.

```Shell
npm install @payloadcms/live-preview
```

--------------------------------

### Integrate Payload Plugin into Next.js Configuration

Source: https://payloadcms.com/docs/getting-started/installation

Wrap your Next.js configuration with the `withPayload` plugin from `@payloadcms/next/withPayload`. This ensures compatibility with various packages Payload relies on, such as `mongodb` or `drizzle-kit`, by modifying the `next.config.js` file.

```JavaScript
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  experimental: {
    reactCompiler: false,
  },
}

// Make sure you wrap your `nextConfig`
// with the `withPayload` plugin
export default withPayload(nextConfig)
```

--------------------------------

### Install Payload CMS SEO Plugin

Source: https://payloadcms.com/docs/plugins/seo

Command to install the `@payloadcms/plugin-seo` package using the pnpm package manager.

```shell
pnpm add @payloadcms/plugin-seo
```

--------------------------------

### Install Project Dependencies

Source: https://payloadcms.com/docs/cloud/configuration

These commands are used to install all necessary project dependencies. This step typically precedes the build process to ensure all required modules are available.

```shell
yarn install
```

```shell
npm install
```

--------------------------------

### Install Lexical Rich Text Editor Package

Source: https://payloadcms.com/docs/rich-text/overview

Instructions on how to install the official Payload CMS Lexical rich text editor package using pnpm, a fast package manager.

```Shell
pnpm install @payloadcms/richtext-lexical
```

--------------------------------

### Install Payload Live Preview for React

Source: https://payloadcms.com/docs/live-preview/client

Installs the necessary npm package `@payloadcms/live-preview-react` to enable client-side live preview functionality specifically for React applications. This package provides the `useLivePreview` hook.

```npm
npm install @payloadcms/live-preview-react
```

--------------------------------

### Configure Payload CMS for Stripe Webhooks

Source: https://payloadcms.com/docs/plugins/stripe

This example illustrates how to configure the Payload CMS `buildConfig` to integrate the Stripe plugin and handle incoming webhooks. It shows how to define specific event handlers for Stripe events like 'customer.subscription.updated' or a generic catch-all function for all events. This setup is crucial for synchronizing data between Stripe and Payload.

```TypeScript
import { buildConfig } from 'payload'
import stripePlugin from '@payloadcms/plugin-stripe'

const config = buildConfig({
  plugins: [
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET,
      webhooks: {
        'customer.subscription.updated': ({ event, stripe, stripeConfig }) => {
          // do something...
        }
      }
      // NOTE: you can also catch all Stripe webhook events and handle the event types yourself
      // webhooks: (event, stripe, stripeConfig) => {
      // switch (event.type): {
      // case 'customer.subscription.updated': {
      // // do something...
      // break;
      // }
      // default: {
      // break;
      // }
      // }
      // }
    })
  ]
})

export default config
```

--------------------------------

### Install Payload CMS Form Builder Plugin

Source: https://payloadcms.com/docs/plugins/form-builder

Instructions for installing the `@payloadcms/plugin-form-builder` package using the pnpm package manager.

```Shell
pnpm add @payloadcms/plugin-form-builder
```

--------------------------------

### Serve Project Application

Source: https://payloadcms.com/docs/cloud/configuration

These commands are used to start the application server, making the built application accessible. This is the final step in the deployment process, allowing users to interact with the application.

```shell
yarn serve
```

```shell
npm run serve
```

--------------------------------

### Setup Local Development Environment for Plugin

Source: https://payloadcms.com/docs/plugins/build-your-own

Commands to manually create a new `dev` directory and initialize a fresh Payload application within it. This serves as a sanitized environment for actively developing and testing your plugin.

```bash
mkdir dev
cd dev
npx create-payload-app@latest
```

--------------------------------

### Install Payload CMS Multi-Tenant Plugin via pnpm

Source: https://payloadcms.com/docs/plugins/multi-tenant

This command installs the `@payloadcms/plugin-multi-tenant` package using pnpm, a fast, disk space efficient package manager. It adds the necessary files to your project's `node_modules` directory, making the plugin available for use in your Payload CMS application.

```Shell
pnpm add @payloadcms/plugin-multi-tenant
```

--------------------------------

### Initialize New Payload Project

Source: https://payloadcms.com/docs/getting-started/what-is-payload

This command quickly sets up a new Payload CMS project using the 'blank' template. It provides a clean canvas for defining custom functionality and is the recommended starting point for new enterprise tools.

```shell
npx create-payload-app@latest -t blank
```

--------------------------------

### Payload CMS REST API Equivalent Regular GET Request

Source: https://payloadcms.com/docs/rest-api/overview

Demonstrates a standard JavaScript `fetch` request to the Payload CMS REST API. This example shows how to construct a GET request with query parameters, include credentials, and set the `Accept-Language` header.

```javascript
const res = await fetch(`${api}/${collectionSlug}?depth=1&locale=en`, {

method: 'GET',

credentials: 'include',

headers: {

'Accept-Language': i18n.language,

},

})
```

--------------------------------

### MongoDB Atlas Connection String Example

Source: https://payloadcms.com/docs/cloud/projects

This snippet provides an example of the MongoDB Atlas connection string format used to connect to your Payload Cloud database instance. It's typically found under the Database tab of your project settings.

```Text
mongodb+srv://your_connection_string
```

--------------------------------

### Example React useLivePreview Hook Implementation

Source: https://payloadcms.com/docs/live-preview/client

This comprehensive example demonstrates how to build a custom `useLivePreview` React hook using the underlying `@payloadcms/live-preview` functions. It showcases state management with `useState` and `useRef`, event handling with `useEffect` and `useCallback`, and the proper lifecycle management for subscribing, sending ready messages, and unsubscribing.

```TypeScript
import { subscribe, unsubscribe, ready } from '@payloadcms/live-preview'
import { useCallback, useEffect, useState, useRef } from 'react'

export const useLivePreview = <T extends any>(props: {
  depth?: number
  initialData: T
  serverURL: string
}): {
  data: T
  isLoading: boolean
} => {
  const { depth = 0, initialData, serverURL } = props
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const hasSentReadyMessage = useRef<boolean>(false)

  const onChange = useCallback((mergedData) => {
    // When a change is made, the `onChange` callback will be called with the merged data
    // Set this merged data into state so that React will re-render the UI
    setData(mergedData)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Listen for `window.postMessage` events from the Admin Panel
    // When a change is made, the `onChange` callback will be called with the merged data
    const subscription = subscribe({
      callback: onChange,
      depth,
      initialData,
      serverURL,
    })

    // Once subscribed, send a `ready` message back up to the Admin Panel
    // This will indicate that the front-end is ready to receive messages
    if (!hasSentReadyMessage.current) {
      hasSentReadyMessage.current = true

      ready({
        serverURL,
      })
    }

    // When the component unmounts, unsubscribe from the `window.postMessage` events
    return () => {
      unsubscribe(subscription)
    }
  }, [serverURL, onChange, depth, initialData])

  return {
    data,
    isLoading,
  }
}
```

--------------------------------

### Install Payload CMS Vercel Content Link Plugin

Source: https://payloadcms.com/docs/integrations/vercel-content-link

Install the `@payloadcms/plugin-csm` plugin using npm. This plugin is essential for enabling Content Source Maps in Payload CMS, which powers Vercel Content Link. An API key is required for installation.

```bash
npm i @payloadcms/plugin-csm
```

--------------------------------

### Run Sentry Next.js Installation Wizard

Source: https://payloadcms.com/docs/plugins/sentry

Command to automatically configure Sentry for a Next.js application, which is a prerequisite for the Payload Sentry plugin.

```shell
npx @sentry/wizard@latest -i nextjs
```

--------------------------------

### Install Payload CMS Redirects Plugin

Source: https://payloadcms.com/docs/plugins/redirects

Installs the `@payloadcms/plugin-redirects` package using pnpm, a JavaScript package manager, to add redirect management capabilities to your Payload CMS project.

```bash
pnpm add @payloadcms/plugin-redirects
```

--------------------------------

### Install Payload CMS Search Plugin

Source: https://payloadcms.com/docs/plugins/search

This command installs the Payload CMS Search Plugin using pnpm, a fast and efficient package manager for JavaScript projects. It adds the plugin as a dependency to your project, making its functionalities available for integration into your Payload application.

```Shell
pnpm add @payloadcms/plugin-search
```

--------------------------------

### Integrate Redirects Plugin into Payload Config

Source: https://payloadcms.com/docs/plugins/redirects

Demonstrates how to integrate the `@payloadcms/plugin-redirects` into a Payload CMS configuration. This example shows how to enable the plugin for a specific collection, such as 'pages', within your `buildConfig` setup.

```typescript
import { buildConfig } from 'payload'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'

const config = buildConfig({
  collections: [
    {
      slug: 'pages',
      fields: [],
    },
  ],
  plugins: [
    redirectsPlugin({
      collections: ['pages'],
    }),
  ],
})

export default config
```

--------------------------------

### Install Slate Editor Package

Source: https://payloadcms.com/docs/rich-text/slate

This command installs the necessary npm package for the Slate rich text editor in your Payload CMS project. It adds `@payloadcms/richtext-slate` to your project's dependencies.

```JavaScript
npm install --save @payloadcms/richtext-slate
```

--------------------------------

### Authenticate User and Make Authorized Request with JWT

Source: https://payloadcms.com/docs/authentication/jwt

This JavaScript example demonstrates how to log in a user to a Payload CMS instance and then use the obtained JSON Web Token (JWT) to make an authenticated request. It shows the initial login `POST` request to `/api/users/login` and subsequent `GET` request with the JWT in the `Authorization` header.

```JavaScript
const user = await fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'dev@payloadcms.com',
    password: 'password',
  }),
}).then((req) => await req.json())

const request = await fetch('http://localhost:3000', {
  headers: {
    Authorization: `JWT ${user.token}`,
  },
})
```

--------------------------------

### Initialize New Payload Project with Blank Template

Source: https://payloadcms.com/docs/index

This command uses `npx` to execute the `create-payload-app` CLI tool, which initializes a new Payload project. The `-t blank` flag specifies that the project should start with a minimal, blank template, allowing developers to define their own functionality from scratch.

```Shell
npx create-payload-app@latest -t blank
```

--------------------------------

### Install Payload Live Preview for Vue

Source: https://payloadcms.com/docs/live-preview/client

Installs the necessary npm package `@payloadcms/live-preview-vue` to enable client-side live preview functionality specifically for Vue 3 or Nuxt 3 applications. This package provides the `useLivePreview` composable.

```npm
npm install @payloadcms/live-preview-vue
```

--------------------------------

### Create New Payload Website Application

Source: https://payloadcms.com/docs/index

This command initializes a new Payload project, specifically configured with the official website template. It uses 'npx' to execute the latest version of the 'create-payload-app' package, providing a quick start for building a Payload-powered website.

```bash
npx create-payload-app@latest -t website
```

--------------------------------

### Install Payload CMS Azure Storage Adapter

Source: https://payloadcms.com/docs/upload/storage-adapters

This command installs the official Azure Blob Storage adapter package for Payload CMS using pnpm, making it available for integration into your project.

```Shell
pnpm add @payloadcms/storage-azure
```

--------------------------------

### Create a Simple beforeDashboard Component

Source: https://payloadcms.com/docs/custom-components/root-components

This example provides a basic React component designed to be injected before the default Payload dashboard. It demonstrates a simple text display, showing how custom content can be added to this specific location within the Admin Panel.

```JavaScript
export default function MyBeforeDashboardComponent() {
  return <div>This is a custom component injected before the Dashboard.</div>
}
```

--------------------------------

### Integrate Payload Plugin into Configuration

Source: https://payloadcms.com/docs/plugins/build-your-own

Example of how to add a custom plugin, `samplePlugin`, to the `plugins` array within the main Payload configuration file. This demonstrates the basic structure for enabling a plugin.

```typescript
import samplePlugin from 'sample-plugin';

const config = buildConfig({
  plugins: [
    // Add plugins here
    samplePlugin({
      enabled: true,
    }),
  ],
});

export default config;
```

--------------------------------

### Install Payload CMS Google Cloud Storage Adapter

Source: https://payloadcms.com/docs/upload/storage-adapters

This command installs the official Google Cloud Storage adapter package for Payload CMS using pnpm, enabling GCS integration into your project.

```Shell
pnpm add @payloadcms/storage-gcs
```

--------------------------------

### Execute Payload CMS jobs via bin script

Source: https://payloadcms.com/docs/jobs-queue/queues

Examples of using the `npx payload jobs:run` command-line utility to process jobs, including specifying a queue and limit, and setting up cron-based execution.

```shell
npx payload jobs:run --queue default --limit 10
```

```shell
npx payload jobs:run --cron "\*/5 \* \* \* \*"
```

--------------------------------

### Initialize Payload TypeScript Project

Source: https://payloadcms.com/docs/typescript/overview

This command utilizes `create-payload-app` to quickly scaffold a new Payload CMS project. Users can select a TypeScript project type during the interactive setup process to immediately begin development with a pre-configured TypeScript environment.

```Shell
npx create-payload-app@latest
```

--------------------------------

### Example Global Configuration for Navigation

Source: https://payloadcms.com/docs/configuration/globals

This example illustrates a simple Global configuration named 'Nav'. It defines a unique slug and an array field 'items' for navigation links. Each item is a relationship field pointing to an existing 'pages' collection, demonstrating how to structure complex global data.

```TypeScript
import { GlobalConfig } from 'payload'

export const Nav: GlobalConfig = {
  slug: 'nav',
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      maxRows: 8,
      fields: [
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages', // "pages" is the slug of an existing collection
          required: true,
        },
      ],
    },
  ],
}
```

--------------------------------

### Install Vercel Blob Storage Adapter for Payload CMS

Source: https://payloadcms.com/docs/upload/storage-adapters

This shell command installs the `@payloadcms/storage-vercel-blob` package using pnpm, enabling integration of Vercel Blob storage for file uploads within a Payload CMS project.

```Shell
pnpm add @payloadcms/storage-vercel-blob
```

--------------------------------

### Install Payload CMS Stripe Plugin

Source: https://payloadcms.com/docs/plugins/stripe

Command to install the Payload CMS Stripe plugin using the pnpm package manager. This is the first step to integrate Stripe functionalities into your Payload application.

```pnpm
pnpm add @payloadcms/plugin-stripe
```

--------------------------------

### Install Payload GraphQL Dependency

Source: https://payloadcms.com/docs/graphql/graphql-schema

This command installs the `@payloadcms/graphql` package as a development dependency using pnpm, which is required for GraphQL schema generation capabilities in Payload CMS.

```Shell
pnpm add @payloadcms/graphql -D
```

--------------------------------

### Payload Collection with Custom API Endpoints

Source: https://payloadcms.com/docs/rest-api/overview

Demonstrates how to define a Payload collection ('orders') and add multiple custom API endpoints. Includes examples for GET, POST, and authenticated endpoints, showing how to access request parameters, handle responses, and interact with Payload's data layer.

```TypeScript
import type { CollectionConfig } from 'payload'

// a collection of 'orders' with an additional route for tracking details, reachable at /api/orders/:id/tracking
export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [
    /* ... */
  ],
  endpoints: [
    {
      path: '/:id/tracking',
      method: 'get',
      handler: async (req) => {
        const tracking = await getTrackingInfo(req.routeParams.id)

        if (!tracking) {
          return Response.json({ error: 'not found' }, { status: 404 })
        }

        return Response.json({
          message: `Hello ${req.routeParams.name as string} @ ${req.routeParams.group as string}`,
        })
      },
    },
    {
      path: '/:id/tracking',
      method: 'post',
      handler: async (req) => {
        // `data` is not automatically appended to the request
        // if you would like to read the body of the request
        // you can use `data = await req.json()`
        const data = await req.json()
        await req.payload.update({
          collection: 'tracking',
          data: {
            // data to update the document with
          },
        })
        return Response.json({
          message: 'successfully updated tracking info',
        })
      },
    },
    {
      path: '/:id/forbidden',
      method: 'post',
      handler: async (req) => {
        // this is an example of an authenticated endpoint
        if (!req.user) {
          return Response.json({ error: 'forbidden' }, { status: 403 })
        }

        // do something

        return Response.json({
          message: 'successfully updated tracking info',
        })
      },
    },
  ],
}
```

--------------------------------

### Integrate Form Builder Plugin into Payload Config

Source: https://payloadcms.com/docs/plugins/form-builder

Demonstrates how to import and register the `formBuilderPlugin` within a Payload CMS configuration file. This example shows a basic setup for `buildConfig` including a 'pages' collection and the plugin integration.

```TypeScript
import { buildConfig } from 'payload'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'

const config = buildConfig({
  collections: [
    {
      slug: 'pages',
      fields: [],
    },
  ],
  plugins: [
    formBuilderPlugin({
      // see below for a list of available options
    }),
  ],
})

export default config
```

--------------------------------

### Install Payload CMS Uploadthing Storage Adapter

Source: https://payloadcms.com/docs/upload/storage-adapters

Command to add the `@payloadcms/storage-uploadthing` package to your Payload CMS project using pnpm.

```shell
pnpm add @payloadcms/storage-uploadthing
```

--------------------------------

### Configure Payload Authentication Cookies for Cross-Domain

Source: https://payloadcms.com/docs/authentication/cookies

Provides an example of how to configure authentication cookies within a Payload collection to enable cross-domain requests. This setup involves setting `sameSite` to 'None' and `secure` to `true` to allow the cookie to cross domains securely over HTTPS.

```typescript
{
  slug: 'users',
  auth: {
    cookies: {
      sameSite: 'None',
      secure: true,
    }
  },
  fields: [
    // your auth fields here
  ]
},
```

--------------------------------

### Accessing Current Locale in Payload Client Components

Source: https://payloadcms.com/docs/custom-components/overview

This React Client Component example shows how to use the `useLocale` hook from `@payloadcms/ui` to get the current locale and display localized content based on a translation map.

```JavaScript
'use client'

import React from 'react'

import { useLocale } from '@payloadcms/ui'



function Greeting() {

const locale = useLocale()



const trans = {

en: 'Hello',

es: 'Hola',

}



return <span>{trans[locale.code]}</span>

}
```

--------------------------------

### Payload CMS Authentication: Get Current User Details

Source: https://payloadcms.com/docs/authentication/operations

Explains how to retrieve details of the currently logged-in user. This includes the REST API endpoint and an example response showing user data and token information, along with a corresponding GraphQL query.

```APIDOC
GET http://localhost:3000/api/[collection-slug]/me
```

```APIDOC
{
  "user": {
    "email": "dev@payloadcms.com",
    "createdAt": "2020-12-27T21:16:45.645Z",
    "updatedAt": "2021-01-02T18:37:41.588Z",
    "id": "5ae8f9bde69e394e717c8832"
  },
  "token": "34o4345324...",
  "exp": 1609619861
}
```

```graphql
query {
  me[collection-singular-label] {
    user {
      email
    }
    exp
  }
}
```

--------------------------------

### Generated TypeScript Interfaces from Example Payload Config

Source: https://payloadcms.com/docs/typescript/generating-types

These are the `User` and `Post` TypeScript interfaces automatically generated from the example Payload configuration, illustrating how collection definitions translate into corresponding TypeScript types.

```typescript
export interface User {
id: string
name: string
email?: string
resetPasswordToken?: string
resetPasswordExpiration?: string
loginAttempts?: number
lockUntil?: string
}

export interface Post {
id: string
title?: string
author?: string | User
}
```

--------------------------------

### Example Implementation of Global beforeValidate Hook

Source: https://payloadcms.com/docs/hooks/globals

This code snippet provides an asynchronous example of a `beforeValidate` hook. This hook runs during the `update` operation, allowing modification or formatting of incoming data before server-side validation. It receives `data`, `req`, and `originalDoc` as arguments.

```TypeScript
import type { GlobalBeforeValidateHook } from 'payload'

const beforeValidateHook: GlobalBeforeValidateHook = async ({
data,
req,
originalDoc,
}) => {
return data
}
```

--------------------------------

### Install Payload Cloud Plugin

Source: https://payloadcms.com/docs/cloud/projects

Command to add the Payload Cloud plugin package to your project using pnpm. This is the first step to integrate cloud features into your Payload CMS application.

```shell
pnpm add @payloadcms/payload-cloud
```

--------------------------------

### Example Implementation of Global afterChange Hook

Source: https://payloadcms.com/docs/hooks/globals

This code provides an asynchronous example of an `afterChange` hook. This hook runs after a global document has been successfully updated, making it suitable for post-save operations like cache purging or syncing data with external systems. It receives `doc`, `previousDoc`, and `req`.

```TypeScript
import type { GlobalAfterChangeHook } from 'payload'

const afterChangeHook: GlobalAfterChangeHook = async ({
doc,
previousDoc,
req,
}) => {
return data
}
```

--------------------------------

### Basic Payload TypeScript Configuration Example

Source: https://payloadcms.com/docs/configuration/overview

This snippet demonstrates how to integrate TypeScript configuration within a Payload CMS project using `buildConfig`. It shows the basic structure for adding TypeScript-specific settings to your Payload configuration.

```TypeScript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  typescript: {
    // ...
  }
})
```

--------------------------------

### Install Payload CMS Cloud Storage Plugin

Source: https://payloadcms.com/docs/upload/storage-adapters

Command to add the `@payloadcms/plugin-cloud-storage` package, which is used as a base for creating custom storage adapters in Payload CMS.

```shell
pnpm add @payloadcms/plugin-cloud-storage
```

--------------------------------

### Configure Payload CMS with Uploadthing Storage Adapter

Source: https://payloadcms.com/docs/upload/storage-adapters

Example `payload.config.ts` demonstrating how to integrate the Uploadthing storage adapter, specifying which collections should use it and configuring options like the Uploadthing token and ACL.

```typescript
export default buildConfig({
  collections: [Media],
  plugins: [
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN,
        acl: 'public-read',
      },
    }),
  ],
})
```

--------------------------------

### Retrieve Editor Config in Payload Collection AfterRead Hook

Source: https://payloadcms.com/docs/rich-text/converters

This comprehensive example demonstrates how to retrieve the lexical editor configuration from an existing richText field within a Payload collection's `afterRead` hook. It shows how to find the specific rich text field among sibling fields and then use `editorConfigFactory.fromField` to get its editor configuration, which can then be used for further processing.

```TypeScript
import type { CollectionConfig, RichTextField } from 'payload'

import {
  editorConfigFactory,
  getEnabledNodes,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const MyCollection: CollectionConfig = {
  slug: 'slug',
  fields: [
    {
      name: 'text',
      type: 'text',
      hooks: {
        afterRead: [
          ({ siblingFields, value }) => {
            const field: RichTextField = siblingFields.find(
              (field) => 'name' in field && field.name === 'richText',
            ) as RichTextField

            const editorConfig = editorConfigFactory.fromField({
              field,
            })

            // Now you can use the editor config

            return value
          },
        ],
      },
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
}
```

--------------------------------

### Direct Transaction Management in Payload Scripts

Source: https://payloadcms.com/docs/database/transactions

This example demonstrates how to directly control database transactions in standalone Payload scripts or custom endpoints, offering fine-grained control outside of Payload's default request-based transaction handling. It shows the full lifecycle: initializing Payload, starting a transaction with `payload.db.beginTransaction()`, performing database operations (like `payload.update`) while passing the `transactionID` via a custom `req` object, and then either committing with `payload.db.commitTransaction()` or rolling back with `payload.db.rollbackTransaction()` based on success or error.

```typescript
import payload from 'payload'
import config from './payload.config'

const standalonePayloadScript = async () => {
  // initialize Payload
  await payload.init({ config })

  const transactionID = await payload.db.beginTransaction()

  try {
    // Make an update using the Local API
    await payload.update({
      collection: 'posts',
      data: {
        some: 'data',
      },
      where: {
        slug: { equals: 'my-slug' },
      },
      req: { transactionID },
    })

    /*
    You can make additional db changes or run other functions
    that need to be committed on an all or nothing basis
    */

    // Commit the transaction
    await payload.db.commitTransaction(transactionID)
  } catch (error) {
    // Rollback the transaction
    await payload.db.rollbackTransaction(transactionID)
  }
}

standalonePayloadScript()
```

--------------------------------

### Define a Join Field in PayloadCMS

Source: https://payloadcms.com/docs/fields/join

This example demonstrates how to configure a `join` type field in PayloadCMS. The `collection` property specifies the target collection (`posts`), and the `on` property points to the name of the relationship field (`category`) in the related collection that establishes the connection. This setup allows bi-directional viewing of related documents without data duplication, working in conjunction with an existing relationship field.

```TypeScript
import type { Field } from 'payload'

export const MyJoinField: Field = {
  name: 'relatedPosts',
  type: 'join',
  collection: 'posts',
  on: 'category',
}

// relationship field in another collection:
export const MyRelationshipField: Field = {
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
}
```

--------------------------------

### Create Payload App with Plugin Template

Source: https://payloadcms.com/docs/plugins/build-your-own

Command to quickly set up a new Payload project using the official plugin template, which includes a full life-cycle plugin structure.

```bash
npx create-payload-app@latest --template plugin
```

--------------------------------

### Perform GET Request with Method Override (POST)

Source: https://payloadcms.com/docs/rest-api/overview

Illustrates how to use Payload's method override feature to send a GET request using the HTTP POST method. This is useful when the query string for a traditional GET request becomes too long. It requires setting the `X-Payload-HTTP-Method-Override` header to `GET` and sending parameters in the request body with `Content-Type: application/x-www-form-urlencoded`.

```JavaScript
const res = await fetch(`${api}/${collectionSlug}`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Accept-Language': i18n.language,
    'X-Payload-HTTP-Method-Override': 'GET',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    // your GET parameters here
    param1: 'value1',
    param2: 'value2'
  }).toString()
})
```

--------------------------------

### Example Usage of PayloadCMS useConfig Hook (Server URL)

Source: https://payloadcms.com/docs/admin/react-hooks

Demonstrates how to use the `useConfig` hook in a React component to access and display the PayloadCMS server URL from the configuration.

```TypeScript
'use client'

import { useConfig } from '@payloadcms/ui'

const MyComponent: React.FC = () => {
  const { config } = useConfig()

  return <span>{config.serverURL}</span>
}
```

--------------------------------

### Importing and Using Payload's SCSS Library

Source: https://payloadcms.com/docs/custom-components/overview

This SCSS example shows how to import Payload's UI SCSS library and use its mixins, such as `mid-break`, to apply responsive styles to a custom component's background color.

```SCSS
@import '~@payloadcms/ui/scss';



.my-component {

@include mid-break {

background-color: var(--theme-elevation-900);

}

}
```

--------------------------------

### Extend Payload CMS `onInit` Function

Source: https://payloadcms.com/docs/plugins/build-your-own

This example shows the recommended way to extend a function property like `onInit` in Payload CMS, as functions cannot use spread syntax. It first checks if the `incomingConfig.onInit` function exists and executes it, then proceeds to run additional custom logic, ensuring both existing and new functionalities are performed sequentially.

```TypeScript
config.onInit = async payload => {
  if (incomingConfig.onInit) await incomingConfig.onInit(payload)

  // Add additional onInit code by using the onInitExtension function
  onInitExtension(pluginOptions, payload)
}
```

--------------------------------

### PayloadCMS Live Preview Base Package API Reference

Source: https://payloadcms.com/docs/live-preview/server

API documentation for the `@payloadcms/live-preview` package, detailing available functions like `ready` and `isDocumentEvent` for custom live preview implementations.

```APIDOC
@payloadcms/live-preview:
  ready(): Sends a window.postMessage event to the Admin Panel to indicate that the front-end is ready to receive messages.
  isDocumentEvent(event: MessageEvent, serverURL: string): Checks if a MessageEvent originates from the Admin Panel and is a document-level event, i.e. draft save, autosave, publish, etc.
```

--------------------------------

### Integrate a Custom Payload Plugin

Source: https://payloadcms.com/docs/plugins/overview

This example shows how to integrate a specific custom plugin, `addLastModified`, into the Payload configuration. Plugins are passed as elements within the `plugins` array, demonstrating a practical application of the plugin system.

```JavaScript
import { buildConfig } from 'payload'
import { addLastModified } from './addLastModified.ts'

const config = buildConfig({
  // ...
  plugins: [addLastModified],
})
```

--------------------------------

### Example Payload Collection with Select Field

Source: https://payloadcms.com/docs/fields/select

This comprehensive example demonstrates how to define a `CollectionConfig` in Payload CMS that includes a 'select' field. It showcases the use of `hasMany` for multiple selections, `admin` options for UI customization (clearable, sortable), and a predefined list of `options` with labels and values.

```typescript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'selectedFeatures', // required
      type: 'select', // required
      hasMany: true,
      admin: {
        isClearable: true,
        isSortable: true, // use mouse to drag and drop different values, and sort them according to your choice
      },
      options: [
        {
          label: 'Metallic Paint',
          value: 'metallic_paint',
        },
        {
          label: 'Alloy Wheels',
          value: 'alloy_wheels',
        },
        {
          label: 'Carbon Fiber Dashboard',
          value: 'carbon_fiber_dashboard',
        },
      ],
    },
  ],
}
```

--------------------------------

### Example .env File Structure

Source: https://payloadcms.com/docs/configuration/environment-vars

Illustrates the basic structure of a `.env` file, defining common environment variables like server URL and database URI for a Payload application. This file should be placed at the root of your project.

```env
SERVER_URL=localhost:3000
DATABASE_URI=mongodb://localhost:27017/my-database
```

--------------------------------

### Create a Simple Custom Action Component

Source: https://payloadcms.com/docs/custom-components/root-components

This example provides a basic React component that can be used as a custom action in the Payload Admin Panel. It demonstrates a simple button that triggers an alert, illustrating how custom interactivity can be added to the Admin Panel header.

```JavaScript
export default function MyCustomAction() {
  return (
    <button onClick={() => alert('Hello, world!')}>
      This is a custom action component
    </button>
  )
}
```

--------------------------------

### Example Collection with Point Field

Source: https://payloadcms.com/docs/fields/point

This example demonstrates how to integrate a 'location' Point field into a Payload CMS collection configuration. It shows the structure for defining a field with a specific name, type, and label within a collection's `fields` array.

```TypeScript
import type { CollectionConfig } from 'payload';

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'location',
      type: 'point',
      label: 'Location'
    }
  ]
};
```

--------------------------------

### Example Usage of PayloadCMS useConfig Hook (getEntityConfig)

Source: https://payloadcms.com/docs/admin/react-hooks

Demonstrates how to use the `useConfig` hook's `getEntityConfig` method to retrieve specific collection or global configurations by slug.

```TypeScript
'use client'

import { useConfig } from '@payloadcms/ui'

const MyComponent: React.FC = () => {
  const { getEntityConfig } = useConfig()
  const mediaConfig = getEntityConfig({ collectionSlug: 'media' })

  return (
    <span>The media collection has {mediaConfig.fields.length} fields.</span>
  )
}
```

--------------------------------

### Example Payload Collection Configuration

Source: https://payloadcms.com/docs/configuration/collections

This snippet provides a basic example of a `CollectionConfig` for 'Posts'. It defines a unique `slug` for the collection and specifies its fields, such as a 'title' field of type 'text'. This structure is used to define the schema for documents within the collection.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
```

--------------------------------

### Example Payload Configuration for Type Generation

Source: https://payloadcms.com/docs/typescript/generating-types

A simple Payload configuration demonstrating collections and fields. This configuration serves as the input for the type generation process, showing how your schema defines the resulting TypeScript types.

```typescript
import type { Config } from 'payload'

const config: Config = {
serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
admin: {
user: 'users',
},
collections: [
{
slug: 'users',
fields: [
{
name: 'name',
type: 'text',
required: true,
},
],
},
{
slug: 'posts',
admin: {
useAsTitle: 'title',
},
fields: [
{
name: 'title',
type: 'text',
},
{
name: 'author',
type: 'relationship',
relationTo: 'users',
},
],
},
],
}
```

--------------------------------

### Example Payload Custom Authentication Strategy with Headers

Source: https://payloadcms.com/docs/authentication/custom-strategies

Illustrates a complete TypeScript example of a custom authentication strategy for Payload CMS. This strategy authenticates users based on 'code' and 'secret' values found in request headers, querying a 'users' collection, and optionally setting response headers.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    disableLocalStrategy: true,
    strategies: [
      {
        name: 'custom-strategy',
        authenticate: async ({ payload, headers }) => {
          const usersQuery = await payload.find({
            collection: 'users',
            where: {
              code: {
                equals: headers.get('code')
              },
              secret: {
                equals: headers.get('secret')
              }
            }
          })

          return {
            // Send the user with the collection slug back to authenticate,
            // or send null if no user should be authenticated
            user: usersQuery.docs[0] ? {
              collection: 'users',
              ...usersQuery.docs[0]
            } : null,

            // Optionally, you can return headers
            // that you'd like Payload to set here when
            // it returns the response
            responseHeaders: new Headers({
              'some-header': 'my header value'
            })
          }
        }
      }
    ]
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      index: true,
      unique: true
    },
    {
      name: 'secret',
      type: 'text'
    }
  ]
}
```

--------------------------------

### Example Payload Collection with Dynamic Relationship Filtering

Source: https://payloadcms.com/docs/fields/relationship

A TypeScript example demonstrating how to define a Payload Collection with a relationship field that dynamically filters available options based on the `relationTo` property and `siblingData`.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'purchase',
      type: 'relationship',
      relationTo: ['products', 'services'],
      filterOptions: ({ relationTo, siblingData }) => {
        // returns a Where query dynamically by the type of relationship
        if (relationTo === 'products') {
          return {
            stock: { greater_than: siblingData.quantity }
          }
        }

        if (relationTo === 'services') {
          return {
            isAvailable: { equals: true }
          }
        }
      }
    }
  ]
}
```

--------------------------------

### Configure Payload CMS with Stripe Plugin

Source: https://payloadcms.com/docs/plugins/stripe

Example demonstrating how to integrate the Stripe plugin into your Payload CMS configuration. This snippet shows how to import the plugin and include it in the `plugins` array of your `buildConfig`, typically providing the `stripeSecretKey` from environment variables.

```javascript
import { buildConfig } from 'payload'
import { stripePlugin } from '@payloadcms/plugin-stripe'

const config = buildConfig({
  plugins: [
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    }),
  ],
})

export default config
```

--------------------------------

### Install AWS S3 Storage Adapter for Payload CMS

Source: https://payloadcms.com/docs/upload/storage-adapters

This shell command installs the `@payloadcms/storage-s3` package using pnpm, which is necessary to integrate Amazon S3 as a file storage solution within your Payload CMS application.

```Shell
pnpm add @payloadcms/storage-s3
```

--------------------------------

### Configure Payload CMS with Custom Cloud Storage Plugin

Source: https://payloadcms.com/docs/upload/storage-adapters

Example `payload.config.ts` showing how to integrate the `cloudStorage` plugin with a custom adapter for a specific collection, allowing for tailored storage solutions.

```typescript
import { buildConfig } from 'payload'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'

export default buildConfig({
  plugins: [
    cloudStorage({
      collections: {
        'my-collection-slug': {
          adapter: theAdapterToUse, // see docs for the adapter you want to use
        },
      },
    }),
  ],
  // The rest of your config goes here
})
```

--------------------------------

### Configure Payload with @payloadcms/db-vercel-postgres

Source: https://payloadcms.com/docs/database/postgres

This example illustrates how to use the `@payloadcms/db-vercel-postgres` adapter. It shows both the default usage, which automatically uses `process.env.POSTGRES_URL`, and an optional configuration with explicit `pool` options.

```typescript
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

export default buildConfig({
  // Automatically uses process.env.POSTGRES_URL if no options are provided.
  db: vercelPostgresAdapter(),
  // Optionally, can accept the same options as the @vercel/postgres package.
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
})
```

--------------------------------

### Payload CMS Live Preview Configuration Options

Source: https://payloadcms.com/docs/live-preview/overview

This section details the available configuration options for Payload CMS's Live Preview feature, including properties for defining the front-end URL, breakpoints, and enabling Live Preview for specific collections or globals. It also outlines the arguments passed to the dynamic URL function.

```APIDOC
admin.livePreview:
  url: string | function
    Description: String, or function that returns a string, pointing to your front-end application. This value is used as the iframe `src`. (Required)
    Function Arguments:
      data: object
        Description: The data of the Document being edited. This includes changes that have not yet been saved.
      locale: object
        Description: The locale currently being edited (if applicable).
      collectionConfig: object
        Description: The Collection Admin Config of the Document being edited.
      globalConfig: object
        Description: The Global Admin Config of the Document being edited.
      req: object
        Description: The Payload Request object.
  breakpoints: array
    Description: Array of breakpoints to be used as “device sizes” in the preview window. Each item appears as an option in the toolbar.
  collections: array<string>
    Description: Array of collection slugs to enable Live Preview on.
  globals: array<string>
    Description: Array of global slugs to enable Live Preview on.
```

--------------------------------

### Install Payload Nested Docs Plugin via pnpm

Source: https://payloadcms.com/docs/plugins/nested-docs

This snippet demonstrates how to install the Payload CMS Nested Docs plugin using the pnpm package manager. This is the first step to integrate the plugin into your Payload project.

```Shell
pnpm add @payloadcms/plugin-nested-docs
```

--------------------------------

### Install Sentry Plugin via pnpm

Source: https://payloadcms.com/docs/plugins/sentry

Command to add the Sentry plugin package to your Payload project using the pnpm package manager.

```shell
pnpm add @payloadcms/plugin-sentry
```

--------------------------------

### Build Project Application

Source: https://payloadcms.com/docs/cloud/configuration

These commands compile or build the application for production or deployment. The output of this step is the ready-to-serve application.

```shell
yarn build
```

```shell
npm run build
```

--------------------------------

### Example Usage of Collapsible Field in Payload Collection

Source: https://payloadcms.com/docs/fields/collapsible

This comprehensive example illustrates how to integrate a Collapsible Field within a Payload CMS collection, including nested text fields and dynamic labeling based on collection data.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
slug: 'example-collection',
fields: [
{
label: ({ data }) => data?.title || 'Untitled',
type: 'collapsible', // required
fields: [
// required
{
name: 'title',
type: 'text',
required: true,
},
{
name: 'someTextField',
type: 'text',
required: true,
},
],
},
],
}
```

--------------------------------

### Payload Configuration with MongoDB Adapter and Basic Collection

Source: https://payloadcms.com/docs/configuration/overview

This example demonstrates a more comprehensive Payload configuration, showcasing how to integrate a MongoDB database adapter and define a simple data collection. It sets a secret, configures the database connection using `mongooseAdapter` with an environment variable for the URI, and defines a 'pages' collection with a single 'title' text field. This illustrates the process of connecting a database and structuring data schemas within the Payload config.

```TypeScript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  collections: [
    {
      slug: 'pages',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
      ],
    },
  ],
})
```

--------------------------------

### Payload Stripe Plugin Configuration (`stripePlugin`)

Source: https://payloadcms.com/docs/plugins/stripe

Documentation for the configuration options available when initializing the Payload Stripe plugin. This includes setting up API keys and defining webhook handling logic.

```APIDOC
stripePlugin(options: object): PayloadPlugin
  options:
    stripeSecretKey: string (required)
      Your Stripe secret key, typically from environment variables (e.g., process.env.STRIPE_SECRET_KEY).
    stripeWebhooksEndpointSecret: string (optional)
      Your Stripe webhooks endpoint secret, also from environment variables (e.g., process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET).
    webhooks: object | function (optional)
      Configuration for handling Stripe webhook events.
      If object: Maps specific Stripe event types to handler functions.
        'customer.subscription.updated': function ({ event: object, stripe: object, stripeConfig: object }) => void
          A function to be executed when a 'customer.subscription.updated' event is received.
      If function: A single function to catch and process all Stripe webhook events.
        (event: object, stripe: object, stripeConfig: object) => void
          A function that receives the raw Stripe event, Stripe client, and plugin config.
```

--------------------------------

### PayloadCMS Local API Populate Override Example

Source: https://payloadcms.com/docs/queries/select

This TypeScript example demonstrates how to use the `populate` option within Payload's Local API `payload.find` method. It shows how to explicitly select specific fields (e.g., `text`) from populated documents in a related collection (e.g., 'pages'), effectively overriding any `defaultPopulate` settings defined for that collection.

```typescript
import type { Payload } from 'payload'

const getPosts = async (payload: Payload) => {
  const posts = await payload.find({
    collection: 'posts',
    populate: {
      // Select only `text` from populated docs in the "pages" collection
      // Now, no matter what the `defaultPopulate` is set to on the "pages" collection,
      // it will be overridden, and the `text` field will be returned instead.
      pages: {
        text: true,
      },
    },
  })

  return posts
}
```

--------------------------------

### Example Payload CMS Collection with Upload Field

Source: https://payloadcms.com/docs/fields/upload

This TypeScript example demonstrates how to integrate an upload field into a Payload CMS collection configuration. It defines a 'backgroundImage' field of type 'upload', relating it to the 'media' collection and marking it as required.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'backgroundImage', // required
      type: 'upload', // required
      relationTo: 'media', // required
      required: true
    }
  ]
}
```

--------------------------------

### Uploadthing Storage Adapter Configuration Options

Source: https://payloadcms.com/docs/upload/storage-adapters

Detailed options available for configuring the `@payloadcms/storage-uploadthing` plugin within your Payload CMS setup.

```APIDOC
Option: token
  Description: Token from Uploadthing. Required.
  Default: 
Option: acl
  Description: Access control list for files that are uploaded
  Default: public-read
Option: logLevel
  Description: Log level for Uploadthing
  Default: info
Option: fetch
  Description: Custom fetch function
  Default: fetch
Option: defaultKeyType
  Description: Default key type for file operations
  Default: fileKey
Option: clientUploads
  Description: Do uploads directly on the client to bypass limits on Vercel.
```

--------------------------------

### Drizzle ORM: Example Table Definitions (Introspection Output)

Source: https://payloadcms.com/docs/database/postgres

Illustrates typical Drizzle ORM table definitions for PostgreSQL, often generated via Drizzle Introspection. This example defines `users` and `countries` tables, showcasing primary keys, various column types (`serial`, `varchar`, `text`), and unique indexes.

```TypeScript
import {
  pgTable,
  uniqueIndex,
  serial,
  varchar,
  text
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 })
});

export const countries = pgTable(
  'countries',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 })
  },
  (countries) => {
    return {
      nameIndex: uniqueIndex('name_idx').on(countries.name)
    };
  }
);
```

--------------------------------

### Example Payload CMS Block and Collection Definition

Source: https://payloadcms.com/docs/fields/blocks

This example demonstrates how to define a custom block (`QuoteBlock`) and integrate it into a Payload CMS collection (`ExampleCollection`). It showcases the use of `slug`, `imageURL`, `imageAltText`, `interfaceName`, and `fields` for the block, and how to define a `blocks` field within a collection to utilize the custom block.

```TypeScript
import { Block, CollectionConfig } from 'payload'

const QuoteBlock: Block = {
  slug: 'Quote', // required
  imageURL: 'https://google.com/path/to/image.jpg',
  imageAltText: 'A nice thumbnail image to show what this block looks like',
  interfaceName: 'QuoteBlock', // optional
  fields: [
    // required
    {
      name: 'quoteHeader',
      type: 'text',
      required: true,
    },
    {
      name: 'quoteText',
      type: 'text',
    },
  ],
}

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'layout', // required
      type: 'blocks', // required
      minRows: 1,
      maxRows: 20,
      blocks: [
        // required
        QuoteBlock,
      ],
    },
  ],
}
```

--------------------------------

### Import Sentry Plugin TypeScript Types

Source: https://payloadcms.com/docs/plugins/sentry

Example of importing the `PluginOptions` type directly from the Sentry plugin package for use in TypeScript projects.

```typescript
import { PluginOptions } from '@payloadcms/plugin-sentry'
```

--------------------------------

### Install Payload CMS Translations Package

Source: https://payloadcms.com/docs/configuration/i18n

This command installs the `@payloadcms/translations` package, which is essential for enabling internationalization features within your Payload CMS application. It provides the necessary utilities and built-in language files.

```pnpm
pnpm install @payloadcms/translations
```

--------------------------------

### Define a Payload Global Configuration

Source: https://payloadcms.com/docs/graphql/overview

Example TypeScript code demonstrating how to define a `GlobalConfig` for a 'header' global in Payload CMS, indicating where its fields would be defined.

```typescript
import type { GlobalConfig } from 'payload';

const Header: GlobalConfig = {
  slug: 'header',
  fields: [
    ...
  ],
}
```

--------------------------------

### Integrate `useLivePreview` Composable in Vue Component

Source: https://payloadcms.com/docs/live-preview/client

Demonstrates how to use the `useLivePreview` composable from `@payloadcms/live-preview-vue` within a Vue component using the `<script setup>` syntax. It shows importing the composable and preparing to receive initial data, which the composable will then keep in sync.

```vue
<script setup lang="ts">
import type { PageData } from '~/types';
import { defineProps } from 'vue';
import { useLivePreview } from '@payloadcms/live-preview-vue';

// Fetch the initial data on the parent component or using async state
const props = defineProps<{ initialData: PageData }>();

// The hook will take over from here and keep the preview in sync with the changes you make.
</script>
```

--------------------------------

### Example Text Field in a Payload Collection

Source: https://payloadcms.com/docs/fields/text

This snippet provides a complete example of how to define a Text Field within a Payload CMS Collection configuration. It demonstrates setting a required 'pageTitle' field of type 'text' for a collection named 'example-collection'.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
slug: 'example-collection',
fields: [
{
name: 'pageTitle', // required
type: 'text', // required
required: true
}
]
}
```

--------------------------------

### Example Payload CMS Paginated Find Query Response

Source: https://payloadcms.com/docs/queries/pagination

Illustrates a typical JSON response structure for a paginated `find` query, showing the `docs` array and pagination metadata.

```json
{
  "docs": [
    {
      "title": "Page Title",
      "description": "Some description text",
      "priority": 1,
      "createdAt": "2020-10-17T01:19:29.858Z",
      "updatedAt": "2020-10-17T01:19:29.858Z",
      "id": "5f8a46a1dd05db75c3c64760"
    }
  ],
  "totalDocs": 6,
  "limit": 1,
  "totalPages": 6,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

--------------------------------

### Locale-Based Access Control Example

Source: https://payloadcms.com/docs/access-control/overview

This example shows how to implement access control that varies by locale. It grants access only when the request's locale (`req.locale`) is 'en', denying access for all other locales, illustrating conditional access based on request properties.

```JavaScript
const access = ({ req }) => {
// Grant access if the locale is 'en'
if (req.locale === 'en') {
return true
}

// Deny access for all other locales
return false
}
```

--------------------------------

### Custom GenerateTitle Function Example for Payload CMS SEO Plugin

Source: https://payloadcms.com/docs/plugins/seo

Provides a practical example of how to implement a custom `generateTitle` function using TypeScript. This function takes a document (e.g., `Page` type) and locale, then returns a dynamically formatted title string, showcasing how to tailor SEO titles based on content.

```TypeScript
import type { Page } from './payload-types.ts'

import type { GenerateTitle } from '@payloadcms/plugin-seo/types'

const generateTitle: GenerateTitle<Page> = async ({ doc, locale }) => {
  return `Website.com — ${doc?.title}`
}
```

--------------------------------

### Example: Using usePreferences Hook in a Custom Admin Component

Source: https://payloadcms.com/docs/admin/preferences

Demonstrates how to integrate the `usePreferences` hook within a custom React component for the Payload CMS Admin Panel. This example shows how to retrieve and update a user's 'last used colors' preference, ensuring persistence across sessions.

```JavaScript
'use client'

import React, { Fragment, useState, useEffect, useCallback } from 'react'
import { usePreferences } from '@payloadcms/ui'

const lastUsedColorsPreferenceKey = 'last-used-colors'

export function CustomComponent() {
  const { getPreference, setPreference } = usePreferences()

  // Store the last used colors in local state
  const [lastUsedColors, setLastUsedColors] = useState([])

  // Callback to add a color to the last used colors
  const updateLastUsedColors = useCallback(
    (color) => {
      // First, check if color already exists in last used colors.
      // If it already exists, there is no need to update preferences
      const colorAlreadyExists = lastUsedColors.indexOf(color) > -1

      if (!colorAlreadyExists) {
        const newLastUsedColors = [...lastUsedColors, color]

        setLastUsedColors(newLastUsedColors)
```

--------------------------------

### Complete Payload Radio Field Example in a Collection

Source: https://payloadcms.com/docs/fields/radio

This comprehensive example demonstrates how to integrate a Radio Field into a Payload Collection configuration. It includes defining the field name, type, options with labels and values, a default value, and admin-specific layout settings, showcasing a practical implementation.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'color', // required
      type: 'radio', // required
      options: [
        // required
        {
          label: 'Mint',
          value: 'mint',
        },
        {
          label: 'Dark Gray',
          value: 'dark_gray',
        },
      ],
      defaultValue: 'mint', // The first value in options.
      admin: {
        layout: 'horizontal',
      },
    },
  ],
}
```

--------------------------------

### PayloadCMS REST API Populate Override Example

Source: https://payloadcms.com/docs/queries/select

This JavaScript example illustrates how to achieve the same population override using the PayloadCMS REST API. The `populate` option is passed as a URL query parameter, allowing clients to specify which fields should be returned from related documents, such as selecting the `text` field from 'pages' within 'posts'.

```javascript
fetch('https://localhost:3000/api/posts?populate[pages][text]=true')
.then((res) => res.json())
.then((data) => console.log(data))
```

--------------------------------

### Define a Payload Collection Configuration

Source: https://payloadcms.com/docs/graphql/overview

Example TypeScript code demonstrating how to define a `CollectionConfig` for a 'public-users' collection in Payload CMS, enabling authentication and indicating where fields would be defined.

```typescript
import type { CollectionConfig } from 'payload'

export const PublicUser: CollectionConfig = {
  slug: 'public-users',
  auth: true, // Auth is enabled
  fields: [
    ...
  ],
}
```

--------------------------------

### Example Usage of PayloadCMS useAuth Hook

Source: https://payloadcms.com/docs/admin/react-hooks

Demonstrates how to use the `useAuth` hook in a React component to retrieve and display the email of the currently logged-in user.

```TypeScript
'use client'

import { useAuth } from '@payloadcms/ui'
import type { User } from '../payload-types.ts'

const Greeting: React.FC = () => {
  const { user } = useAuth<User>()

  return <span>Hi, {user.email}!</span>
}
```

--------------------------------

### Example Custom RefreshRouteOnSave React Component Implementation

Source: https://payloadcms.com/docs/live-preview/server

Full implementation of a custom `RefreshRouteOnSave` React component, demonstrating how to use `isDocumentEvent` and `ready` from `@payloadcms/live-preview` to refresh a route based on Admin Panel messages.

```typescript
'use client'

import type React from 'react'

import { isDocumentEvent, ready } from '@payloadcms/live-preview'
import { useCallback, useEffect, useRef } from 'react'

export const RefreshRouteOnSave: React.FC<{
  apiRoute?: string
  depth?: number
  refresh: () => void
  serverURL: string
}> = (props) => {
  const { apiRoute, depth, refresh, serverURL } = props
  const hasSentReadyMessage = useRef<boolean>(false)

  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (isDocumentEvent(event, serverURL)) {
        if (typeof refresh === 'function') {
          refresh()
        }
      }
    },
    [refresh, serverURL]
  )
}
```

--------------------------------

### Sentry Plugin Configuration Options Reference

Source: https://payloadcms.com/docs/plugins/sentry

Detailed API documentation for the configuration options available when initializing the Payload Sentry plugin.

```APIDOC
sentryPlugin(options: SentryPluginOptions): Plugin
  Description: Initializes the Sentry plugin for Payload CMS.
  Parameters:
    options: object | required
      Description: Configuration options for the Sentry plugin.
      Properties:
        Sentry: SentryInstance | required
          Description: The Sentry instance to use. Requires completing the Sentry for Next.js Setup.
        enabled: boolean | optional
          Description: Set to false to disable the plugin. Defaults to true.
        context: (args: ContextArgs) => Partial<ScopeContext> | Promise<Partial<ScopeContext>> | optional
          Description: A function to pass additional contextual data to Sentry.
        captureErrors: number[] | optional
          Description: An array of HTTP status codes (e.g., 400, 403) to capture as errors, in addition to the default 500+ errors.
```

--------------------------------

### Example Payload Collection with Number Field

Source: https://payloadcms.com/docs/fields/number

This example demonstrates how to define a Payload CMS collection (`ExampleCollection`) that includes a 'number' field named 'age'. The field is configured as required and includes an `admin` option to set a step increment for its input control in the admin panel.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'age', // required
      type: 'number', // required
      required: true,
      admin: {
        step: 1
      }
    }
  ]
}
```

--------------------------------

### Example Usage of PayloadCMS useSelection Hook

Source: https://payloadcms.com/docs/admin/react-hooks

Demonstrates how to use the `useSelection` hook in a React component to display the count of selected rows and provide a button to toggle all selections.

```TypeScript
'use client'

import { useSelection } from '@payloadcms/ui'

const MyComponent: React.FC = () => {
  const { count, toggleAll, totalDocs } = useSelection()

  return (
    <>
      <span>
        Selected {count} out of {totalDocs} docs!
      </span>
      <button type="button" onClick={() => toggleAll(true)}>
        Toggle All Selections
      </button>
    </>
  )
}
```

--------------------------------

### Configure Sentry Plugin with Custom Options

Source: https://payloadcms.com/docs/plugins/sentry

Example demonstrating how to pass custom options like `captureErrors` and `context` to the Sentry plugin within the Payload configuration.

```javascript
import { buildConfig } from 'payload'
import { sentryPlugin } from '@payloadcms/plugin-sentry'

import * as Sentry from '@sentry/nextjs'

import { Pages, Media } from './collections'

const config = buildConfig({
  collections: [Pages, Media],
  plugins: [
    sentryPlugin({
      options: {
        captureErrors: [400, 403],
        context: ({ defaultContext, req }) => {
          return {
            ...defaultContext,
            tags: {
              locale: req.locale,
            },
          }
        },
        debug: true,
      },
      Sentry,
    }),
  ],
})
```

--------------------------------

### SEO Plugin Options Reference

Source: https://payloadcms.com/docs/plugins/seo

Detailed documentation for the configuration options available when initializing the Payload CMS SEO plugin.

```APIDOC
seoPlugin(options: object)
  options:
    collections: string[]
      description: An array of collection slugs to enable SEO. Enabled collections receive a `meta` field which is an object of title, description, and image subfields.
    globals: string[]
      description: An array of global slugs to enable SEO. Enabled globals receive a `meta` field which is an object of title, description, and image subfields.
    fields: ({ defaultFields }: { defaultFields: Field[] }) => Field[]
      description: A function that takes in the default fields via an object and expects an array of fields in return. You can use this to modify existing fields or add new ones.
    uploadsCollection: string
      description: Set the `uploadsCollection` to your application's upload-enabled collection slug. This is used to provide an `image` field on the `meta` field group.
```

--------------------------------

### Example Jest Test for Payload Plugin

Source: https://payloadcms.com/docs/plugins/build-your-own

A basic Jest test suite demonstrating how to check for seeded data within a Payload plugin's development environment. It queries a collection and asserts the number of documents.

```typescript
let payload: Payload

describe('Plugin tests', () => {
  // Example test to check for seeded data
  it('seeds data accordingly', async () => {
    const newCollectionQuery = await payload.find({
      collection: 'newCollection',
      sort: 'createdAt',
    })

    newCollection = newCollectionQuery.docs

    expect(newCollectionQuery.totalDocs).toEqual(1)
  })
})
```

--------------------------------

### Initialize Payload and Seed Database in Standalone Script

Source: https://payloadcms.com/docs/local-api/outside-nextjs

This TypeScript example demonstrates how to import the Payload configuration, initialize Payload using the `getPayload` function, and perform database operations like creating users and pages in a standalone script. This pattern is highly useful for tasks such as database seeding, one-off data migrations, or other backend processes that require direct interaction with your Payload instance.

```TypeScript
import { getPayload } from 'payload'
import config from '@payload-config'

const seed = async () => {
  // Get a local copy of Payload by passing your config
  const payload = await getPayload({ config })

  const user = await payload.create({
    collection: 'users',
    data: {
      email: 'dev@payloadcms.com',
      password: 'some-password',
    },
  })

  const page = await payload.create({
    collection: 'pages',
    data: {
      title: 'My Homepage',
      // other data to seed here
    },
  })
}

// Call the function here to run your seed script
await seed()
```

--------------------------------

### Example: Global Read Access Control Function

Source: https://payloadcms.com/docs/access-control/globals

Provides a concrete example of a `read` access control function for a Payload Global. This function returns a boolean value, typically based on user authentication, to grant or deny read access to the global document.

```TypeScript
import { GlobalConfig } from 'payload'

const Header: GlobalConfig = {
// ...
access: {
read: ({ req: { user } }) => {
return Boolean(user)
},
},
}
```

--------------------------------

### Example Payload Collection with Row Field

Source: https://payloadcms.com/docs/fields/row

This TypeScript example shows a complete Payload Collection configuration (`ExampleCollection.ts`) that incorporates a Row Field. It demonstrates nesting two text fields (`label` and `value`) within the row, each configured with a 50% width for horizontal display in the Admin Panel.

```TypeScript
import type { CollectionConfig } from 'payload';

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      type: 'row', // required
      fields: [
        // required
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
};
```

--------------------------------

### PayloadCMS Local API: Count Documents

Source: https://payloadcms.com/docs/local-api/overview

Example of counting documents in a PayloadCMS collection that match a specific query using the Local API's `count` method. It demonstrates how to specify the collection, locale, `where` clause, user context, and access control settings.

```JavaScript
// Result will be an object with:
// {
// totalDocs: 10, // count of the documents satisfies query
// }
const result = await payload.count({
  collection: 'posts', // required
  locale: 'en',
  where: {}, // pass a `where` query here
  user: dummyUser,
  overrideAccess: false
})
```

--------------------------------

### Integrate Multi-Tenant Plugin into Payload Config

Source: https://payloadcms.com/docs/plugins/multi-tenant

Example demonstrating how to integrate the multi-tenant plugin into a PayloadCMS configuration, defining a 'tenants' collection with essential fields and configuring the plugin to apply multi-tenancy to specific collections like 'pages' and 'navigation'.

```TypeScript
import { buildConfig } from 'payload'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import type { Config } from './payload-types'

const config = buildConfig({
collections: [
{
slug: 'tenants',
admin: {
useAsTitle: 'name'
},
fields: [
{
name: 'name',
type: 'text',
required: true
},
{
name: 'slug',
type: 'text',
required: true
},
{
name: 'domain',
type: 'text',
required: true
}
]
}
],
plugins: [
multiTenantPlugin<Config>({
collections: {
pages: {},
navigation: {
isGlobal: true
}
}
})
]
})

export default config
```

--------------------------------

### Configure Plugin in Development Environment

Source: https://payloadcms.com/docs/plugins/build-your-own

Snippet showing how the `samplePlugin` is configured within the `dev/payload.config.ts` file when using the plugin template. It highlights where to update plugin options or names.

```typescript
plugins: [
  // when you rename the plugin or add options, make sure to update it here
  samplePlugin({
    enabled: false,
  })
]
```

--------------------------------

### Importing Custom SCSS Styles into a React Component

Source: https://payloadcms.com/docs/custom-components/overview

This example shows the simple import statement required to include a custom SCSS stylesheet into a React component, allowing for component-specific styling.

```JavaScript
import './index.scss'
```

--------------------------------

### Payload CMS Live Preview Client API Reference

Source: https://payloadcms.com/docs/live-preview/client

This section documents the core functions provided by the `@payloadcms/live-preview` package, including `subscribe`, `unsubscribe`, `ready`, and `isLivePreviewEvent`. It details their purpose, parameters, and how they facilitate communication between the client-side front-end and the Payload Admin Panel for live data updates.

```APIDOC
Package: @payloadcms/live-preview

Functions:
- subscribe(callback: Function, serverURL: string, initialData?: any, depth?: number)
  Description: Subscribes to the Admin Panel's window.postMessage events and calls the provided callback function.
  Arguments:
    - callback*: A callback function that is called with data every time a change is made to the document.
    - serverURL*: The URL of your Payload server.
    - initialData: The initial data of the document. The live data will be merged in as changes are made.
    - depth: The depth of the relationships to fetch. Defaults to 0.

- unsubscribe(subscription: any)
  Description: Unsubscribes from the Admin Panel's window.postMessage events.

- ready(options: { serverURL: string })
  Description: Sends a window.postMessage event to the Admin Panel to indicate that the front-end is ready to receive messages.

- isLivePreviewEvent(event: MessageEvent)
  Description: Checks if a MessageEvent originates from the Admin Panel and is a Live Preview event, i.e. debounced form state.
```

--------------------------------

### API Documentation: usePreferences Hook

Source: https://payloadcms.com/docs/admin/react-hooks

The `usePreferences` hook provides methods to set and get user preferences within the Payload CMS admin interface.

```APIDOC
usePreferences():
  Returns methods to set and get user preferences.
```

--------------------------------

### Conceptual Steps for Building Custom Router Refresh Component

Source: https://payloadcms.com/docs/live-preview/server

Outline of the logical steps required to build a custom router refresh component using `@payloadcms/live-preview` functions, including listening for events, sending ready messages, and refreshing routes.

```typescript
import { ready, isDocumentEvent } from '@payloadcms/live-preview'

// To build your own component:
// 1. Listen for document-level `window.postMessage` events sent from the Admin Panel
// 2. Tell the Admin Panel when it is ready to receive messages
// 3. Refresh the route every time a new document-level event is received
// 4. Unsubscribe from the `window.postMessage` events when it unmounts
```

--------------------------------

### Payload CMS Forgot Password Operations

Source: https://payloadcms.com/docs/authentication/operations

Comprehensive examples demonstrating how to initiate a password reset process in Payload CMS across different API interfaces: REST, GraphQL, and Local API. Each example shows the required parameters and typical usage for sending a forgot password request.

```javascript
fetch(
  `http://localhost:3000/api/[collection-slug]/forgot-password`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'dev@payloadcms.com',
    }),
  },
)
```

```graphql
mutation {
  forgotPassword[collection-singular-label](email: "dev@payloadcms.com")
}
```

```javascript
const token = await payload.forgotPassword({
  collection: 'collection-slug',
  data: {
    email: 'dev@payloadcms.com',
  },
  disableEmail: false // you can disable the auto-generation of email via Local API
})
```

--------------------------------

### Payload CMS Rich Text Client Feature Markdown Transformer Example

Source: https://payloadcms.com/docs/rich-text/custom-features

Shows an example of defining a client-side markdown transformer for the Payload CMS rich text editor, demonstrating how to convert specific markdown patterns into custom nodes. Note: The provided code snippet is incomplete.

```typescript
import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import type { ElementTransformer } from '@payloadcms/richtext-lexical/lexical/markdown'
import { $createMyNode, $isMyNode, MyNode } from './nodes/MyNode'

const MyMarkdownTransformer: ElementTransformer = {
  type: 'element',
  dependencies: [MyNode],
  export: (node, exportChildren) => {
    if (!$isMyNode(node)) {
      return null
    }
    return '+++'
  },
  // match ---
  regExp: /^+++\s\*$/,
  replace: (parentNode) => {
    const node = $createMyNode()
    if (node) {
```

--------------------------------

### Live Preview Breakpoint Options Reference

Source: https://payloadcms.com/docs/live-preview/overview

This section details the available configuration options for each breakpoint object within the PayloadCMS Live Preview settings. It outlines the required properties and their descriptions, which are used to define custom device dimensions for the preview window.

```APIDOC
Breakpoint Options:
  label: string (required)
    Description: The label to display in the drop-down. This is what the user will see.
  name: string (required)
    Description: The name of the breakpoint.
  width: number (required)
    Description: The width of the breakpoint. This is used to set the width of the iframe.
  height: number (required)
    Description: The height of the breakpoint. This is used to set the height of the iframe.
```

--------------------------------

### Example Usage of PayloadCMS useLocale Hook

Source: https://payloadcms.com/docs/admin/react-hooks

Demonstrates how to use the `useLocale` hook in a React component to retrieve the current locale and display a localized greeting.

```TypeScript
'use client'

import { useLocale } from '@payloadcms/ui'

const Greeting: React.FC = () => {
  const locale = useLocale()

  const trans = {
    en: 'Hello',
    es: 'Hola'
  }

  return <span> {trans[locale.code]} </span>
}
```

--------------------------------

### Configure Advanced Authentication Options for a Payload Collection

Source: https://payloadcms.com/docs/authentication/overview

This example shows how to enable authentication with custom options for a Payload Collection. It illustrates configuring `tokenExpiration` for session duration, `verify` for email verification, `maxLoginAttempts` to prevent brute-force attacks, and `lockTime` for temporary user lockout. These options provide fine-grained control over authentication behavior and security.

```typescript
import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  // ...
  auth: {
    tokenExpiration: 7200, // How many seconds to keep the user logged in
    verify: true, // Require email verification before being allowed to authenticate
    maxLoginAttempts: 5, // Automatically lock a user out after X amount of failed logins
    lockTime: 600 * 1000, // Time period to allow the max login attempts
    // More options are available
  },
}
```

--------------------------------

### Example Payload Collection with Nested Group Field

Source: https://payloadcms.com/docs/fields/group

Illustrates how to define a Group Field named 'pageMeta' within a Payload Collection. This example nests 'title' and 'description' fields, each with specific validation rules, and demonstrates the use of `interfaceName` for generating custom TypeScript interfaces and GraphQL types.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'pageMeta',
      type: 'group', // required
      interfaceName: 'Meta', // optional
      fields: [
        // required
        {
          name: 'title',
          type: 'text',
          required: true,
          minLength: 20,
          maxLength: 100
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          minLength: 40,
          maxLength: 160
        }
      ]
    }
  ]
}
```

--------------------------------

### Configure Payload with Mongoose Database Adapter

Source: https://payloadcms.com/docs/database/overview

This example shows how to integrate the Mongoose database adapter into your Payload configuration. It imports `buildConfig` from `payload` and `mongooseAdapter` from `@payloadcms/db-mongodb`, then assigns the adapter to the `db` property within `buildConfig`, using an environment variable for the database URI.

```typescript
import { buildConfig } from 'payload'

import { mongooseAdapter } from '@payloadcms/db-mongodb'


export default buildConfig({
  // ...
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
})
```

--------------------------------

### Programmatic Route Transition with useRouteTransition Hook

Source: https://payloadcms.com/docs/admin/react-hooks

Demonstrates how to use the startRouteTransition method from the useRouteTransition hook to programmatically initiate a route transition, especially when integrating with router libraries like next/navigation.

```tsx
'use client'\nimport React, { useCallback } from 'react'\nimport { useTransition } from '@payloadcms/ui'\nimport { useRouter } from 'next/navigation'\n\nconst MyComponent: React.FC = () => {\n  const router = useRouter()\n  const { startRouteTransition } = useTransition()\n\n  const redirectSomewhere = useCallback(() => {\n    startRouteTransition(() => router.push('/somewhere'))\n  }, [startRouteTransition, router])\n\n  // ...\n}
```

--------------------------------

### Define All Available Global Hook Types

Source: https://payloadcms.com/docs/hooks/globals

This example illustrates how to define an array of synchronous or asynchronous functions for each available global lifecycle hook within the `hooks` property of a GlobalConfig. It showcases `beforeValidate`, `beforeChange`, `beforeRead`, `afterChange`, and `afterRead` hooks.

```TypeScript
import type { GlobalConfig } from 'payload';

const GlobalWithHooks: GlobalConfig = {
// ...
hooks: {
beforeValidate: [(args) => {...}],
beforeChange: [(args) => {...}],
beforeRead: [(args) => {...}],
afterChange: [(args) => {...}],
afterRead: [(args) => {...}],
}
}
```

--------------------------------

### Configure Root Hooks in Payload

Source: https://payloadcms.com/docs/hooks/overview

This snippet demonstrates how to add root-level hooks to your Payload configuration using the `hooks` property within `buildConfig`. It shows a basic setup for an `afterError` hook.

```TypeScript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  hooks: {
    afterError:[() => {...}]
  }
})
```

--------------------------------

### Payload `useLivePreview` Hook Arguments API

Source: https://payloadcms.com/docs/live-preview/client

Documents the common arguments accepted by the `useLivePreview` hook provided by Payload CMS for client-side live preview. It details required and optional parameters like `serverURL`, `initialData`, `depth`, and `apiRoute`, which configure how the live preview data is fetched and merged.

```APIDOC
useLivePreview(args: object):
  serverURL*: string - The URL of your Payload server. (required)
  initialData: any - The initial data of the document. The live data will be merged in as changes are made.
  depth: number - The depth of the relationships to fetch. Defaults to 0.
  apiRoute: string - The path of your API route as defined in routes.api. Defaults to /api.
```

--------------------------------

### Create `beforeList` Server Component in React

Source: https://payloadcms.com/docs/custom-components/list-view

An example of a React server component for the `beforeList` injection point in Payload CMS. It imports `BeforeListServerProps` and renders a simple div.

```TypeScript
import React from 'react'
import type { BeforeListServerProps } from 'payload'

export function MyBeforeListComponent(props: BeforeListServerProps) {
  return <div>This is a custom beforeList component (Server)</div>
}
```

--------------------------------

### Payload Local API Find Operation

Source: https://payloadcms.com/docs/queries/overview

Demonstrates how to use the `payload.find` method with a `where` clause in the Local API to query a collection. This example retrieves posts where the 'color' field equals 'mint'.

```TypeScript
import type { Payload } from 'payload'

const getPosts = async (payload: Payload) => {
  const posts = await payload.find({
    collection: 'posts',
    where: {
      color: {
        equals: 'mint',
      },
    },
  })

  return posts
}
```

--------------------------------

### Conceptual Outline for Building a Custom Live Preview Hook

Source: https://payloadcms.com/docs/live-preview/client

This conceptual code snippet outlines the key responsibilities and steps involved in building a custom live preview hook using the `@payloadcms/live-preview` functions. It highlights the need to subscribe to events, merge data, populate relationships, send 'ready' messages, and unsubscribe on unmount.

```JavaScript
import { subscribe, unsubscribe } from '@payloadcms/live-preview'

// To build your own hook, subscribe to Live Preview events using the `subscribe` function
// It handles everything from:
// 1. Listening to `window.postMessage` events
// 2. Merging initial data with active form state
// 3. Populating relationships and uploads
// 4. Calling the `onChange` callback with the result
// Your hook should also:
// 1. Tell the Admin Panel when it is ready to receive messages
// 2. Handle the results of the `onChange` callback to update the UI
// 3. Unsubscribe from the `window.postMessage` events when it unmounts
```

--------------------------------

### Configure Payload with @payloadcms/db-postgres

Source: https://payloadcms.com/docs/database/postgres

This snippet demonstrates how to integrate the `@payloadcms/db-postgres` adapter into your Payload configuration. It shows the basic setup requiring a `pool` object with a `connectionString` for database connection.

```typescript
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  // Configure the Postgres adapter here
  db: postgresAdapter({
    // Postgres-specific arguments go here.
    // `pool` is required.
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
})
```

--------------------------------

### Configure Payload CMS with SEO Plugin

Source: https://payloadcms.com/docs/plugins/seo

Example of integrating the SEO plugin into a Payload CMS configuration. It demonstrates enabling the plugin for specific collections ('pages') and linking an uploads collection ('media'), along with custom `generateTitle` and `generateDescription` functions for auto-generation.

```TypeScript
import { buildConfig } from 'payload';
import { seoPlugin } from '@payloadcms/plugin-seo';

const config = buildConfig({
  collections: [
    {
      slug: 'pages',
      fields: []
    },
    {
      slug: 'media',
      upload: {
        staticDir: "// path to your static directory,"
      },
      fields: []
    }
  ],
  plugins: [
    seoPlugin({
      collections: [
        'pages'
      ],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `Website.com — ${doc.title}`,
      generateDescription: ({ doc }) => doc.excerpt
    })
  ]
});

export default config;
```

--------------------------------

### Execute Custom Payload CMS Bin Script

Source: https://payloadcms.com/docs/configuration/overview

This command line instruction demonstrates how to run a custom bin script registered in Payload CMS using `pnpm`. The `payload` command is followed by the `key` ('seed') assigned to the script in the configuration, triggering its execution.

```shell
pnpm payload seed
```

--------------------------------

### Using Payload's useLivePreview Hook in a Template

Source: https://payloadcms.com/docs/live-preview/client

This snippet demonstrates how to integrate Payload's `useLivePreview` hook within a client-side template (e.g., Svelte or Vue) to fetch and display live data from the Admin UI. It shows how to initialize the hook with `initialData`, `serverURL`, and `depth`, and then render the live `data` in the template.

```JavaScript
const { data } = useLivePreview<PageData>({
  initialData: props.initialData,
  serverURL: "<PAYLOAD_SERVER_URL>",
  depth: 2,
});
```

```HTML
<template>
  <h1>{{ data.title }}</h1>
</template>
```

--------------------------------

### Example Implementation of Global beforeChange Hook

Source: https://payloadcms.com/docs/hooks/globals

This snippet demonstrates an asynchronous `beforeChange` hook. Executed immediately after validation, this hook allows for final modifications to the data before it is saved to the document. It provides access to `data`, `req`, and `originalDoc`.

```TypeScript
import type { GlobalBeforeChangeHook } from 'payload'

const beforeChangeHook: GlobalBeforeChangeHook = async ({
data,
req,
originalDoc,
}) => {
return data
}
```

--------------------------------

### Define a Payload Task with Input/Output Schema and Handler

Source: https://payloadcms.com/docs/jobs-queue/tasks

Example of configuring a 'createPost' Payload Task within the `buildConfig` jobs array. This task demonstrates defining input and output schemas, setting a retry count, and implementing an asynchronous handler function that interacts with Payload's `create` API to create a new post.

```TypeScript
export default buildConfig({
  // ...
  jobs: {
    tasks: [
      {
        // Configure this task to automatically retry
        // up to two times
        retries: 2,

        // This is a unique identifier for the task

        slug: 'createPost',

        // These are the arguments that your Task will accept

        inputSchema: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
        ],

        // These are the properties that the function should output

        outputSchema: [
          {
            name: 'postID',
            type: 'text',
            required: true,
          },
        ],

        // This is the function that is run when the task is invoked

        handler: async ({ input, job, req }) => {
          const newPost = await req.payload.create({
            collection: 'post',
            req,
            data: {
              title: input.title,
            },
          })
          return {
            output: {
              postID: newPost.id,
            },
          }
        },
      } as TaskConfig<'createPost'>,
    ],
  },
})
```

--------------------------------

### Payload Local API Options Reference

Source: https://payloadcms.com/docs/local-api/overview

A comprehensive reference of the specific options available when performing operations via the Payload Local API. These options provide fine-grained control over data handling, access control, localization, and query behavior, leveraging the server-only context of the Local API.

```APIDOC
Local API Options:
  - collection:
      Type: string
      Required: Yes (for Collection operations)
      Description: Specifies the Collection slug to operate against.
  - data:
      Type: any
      Required: Yes (for create, update)
      Description: The data to use within the operation.
  - depth:
      Type: number
      Description: Control auto-population of nested relationship and upload fields.
  - locale:
      Type: string
      Description: Specify locale for any returned documents.
  - select:
      Type: string[] | object
      Description: Specify select to control which fields to include to the result.
  - populate:
      Type: string[] | object
      Description: Specify populate to control which fields to include to the result from populated documents.
  - fallbackLocale:
      Type: string
      Description: Specify a fallback locale to use for any returned documents.
  - overrideAccess:
      Type: boolean
      Default: true
      Description: Skip access control. By default, this property is set to true within all Local API operations.
  - overrideLock:
      Type: boolean
      Default: true
      Description: By default, document locks are ignored (`true`). Set to `false` to enforce locks and prevent operations when a document is locked by another user.
  - user:
      Type: object
      Description: If you set `overrideAccess` to `false`, you can pass a user to use against the access control checks.
  - showHiddenFields:
      Type: boolean
      Description: Opt-in to receiving hidden fields. By default, they are hidden from returned documents in accordance to your config.
  - pagination:
      Type: boolean
      Default: true
      Description: Set to `false` to return all documents and avoid querying for document counts.
  - context:
      Type: object
      Description: Context, which will then be passed to `context` and `req.context`, which can be read by hooks. Useful if you want to pass additional information to the hooks which shouldn't be necessarily part of the document, for example a `triggerBeforeChange` option which can be read by the BeforeChange hook to determine if it should run or not.
```

--------------------------------

### Configure Live Preview Breakpoints in Payload Config

Source: https://payloadcms.com/docs/live-preview/overview

This example illustrates how to define custom device sizes, or 'breakpoints', for the live preview window within your Payload configuration. Each breakpoint object specifies a label, name, width, and height, allowing the preview iframe to resize to exact dimensions when selected from the toolbar.

```TypeScript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    // ...
    livePreview: {
      url: 'http://localhost:3000',
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
      ],
    },
  },
})
```

--------------------------------

### PayloadCMS Local API: Create Document

Source: https://payloadcms.com/docs/local-api/overview

Example of creating a new document in a PayloadCMS collection using the Local API. It illustrates various options including specifying locale, user context, overriding access, disabling verification emails, uploading files via `filePath` or `file` objects, and duplicating an existing document.

```JavaScript
// The created Post document is returned
const post = await payload.create({
  collection: 'posts', // required
  data: {
    // required
    title: 'sure',
    description: 'maybe'
  },
  locale: 'en',
  fallbackLocale: false,
  user: dummyUserDoc,
  overrideAccess: true,
  showHiddenFields: false,

  // If creating verification-enabled auth doc,
  // you can optionally disable the email that is auto-sent
  disableVerificationEmail: true,

  // If your collection supports uploads, you can upload
  // a file directly through the Local API by providing
  // its full, absolute file path.
  filePath: path.resolve(__dirname, './path-to-image.jpg'),

  // Alternatively, you can directly pass a File,
  // if file is provided, filePath will be omitted
  file: uploadedFile,

  // If you want to create a document that is a duplicate of another document
  duplicateFromID: 'document-id-to-duplicate'
})
```

--------------------------------

### Integrate Payload Cloud Plugin into Config

Source: https://payloadcms.com/docs/cloud/projects

Example of how to import and integrate the Payload Cloud plugin into your Payload CMS configuration file, typically `payload.config.ts`. The plugin is added to the `plugins` array within the `buildConfig` function.

```typescript
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { buildConfig } from 'payload'

export default buildConfig({
  plugins: [payloadCloudPlugin()],
  // rest of config
})
```

--------------------------------

### Configure Payload Textarea Field Admin Options

Source: https://payloadcms.com/docs/fields/textarea

This example demonstrates how to apply admin-specific configurations to a Textarea field in Payload CMS using the `admin` property.

```TypeScript
import type { Field } from 'payload'

export const MyTextareaField: Field = {
  // ...
  admin: {

    // ...
  }
}
```

--------------------------------

### Payload CMS Root-level Routes Configuration Options

Source: https://payloadcms.com/docs/admin/overview

API documentation detailing the available options for customizing root-level routes in Payload CMS, including `admin`, `api`, `graphQL`, and `graphQLPlayground` with their default paths and descriptions.

```APIDOC
routes:
  admin:
    default: /admin
    description: The Admin Panel itself.
  api:
    default: /api
    description: The REST API base path.
  graphQL:
    default: /graphql
    description: The GraphQL API base path.
  graphQLPlayground:
    default: /graphql-playground
    description: The GraphQL Playground.
```

--------------------------------

### Example Payload Collection with Textarea Field

Source: https://payloadcms.com/docs/fields/textarea

This snippet illustrates how to integrate a Textarea field into a Payload CMS collection configuration, including `name`, `type`, and `required` properties.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'metaDescription', // required
      type: 'textarea', // required
      required: true
    }
  ]
}
```

--------------------------------

### Docker Compose Configuration for Payload CMS Development

Source: https://payloadcms.com/docs/production/deployment

An example `docker-compose.yml` file for setting up a Payload CMS development environment. It defines services for the Payload application (Node.js) and a MongoDB database, including volume mounts for live reloading and persistent data. An optional PostgreSQL configuration is commented out for flexibility.

```YAML
version: '3'

services:
  payload:
    image: node:18-alpine
    ports:
      - '3000:3000'
    volumes:
      - .:/home/node/app
      - node_modules:/home/node/app/node_modules
    working_dir: /home/node/app/
    command: sh -c "corepack enable && corepack prepare pnpm@latest --activate && pnpm install && pnpm dev"
    depends_on:
      - mongo
      # - postgres
    env_file:
      - .env

  # Ensure your DATABASE_URI uses 'mongo' as the hostname ie. mongodb://mongo/my-db-name
  mongo:
    image: mongo:latest
    ports:
      - '27017:27017'
    command:
      - --storageEngine=wiredTiger
    volumes:
      - data:/data/db
    logging:
      driver: none

  # Uncomment the following to use postgres
  # postgres:
  #   restart: always
  #   image: postgres:latest
  #   volumes:
  #     - pgdata:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

volumes:
  data:
  # pgdata:
  node_modules:
```

--------------------------------

### Payload CMS afterMe Hook Implementation

Source: https://payloadcms.com/docs/hooks/collections

Example TypeScript implementation of the `afterMe` hook in Payload CMS. This hook executes after a `me` operation for auth-enabled collections.

```TypeScript
import type { CollectionAfterMeHook } from 'payload';

const afterMeHook: CollectionAfterMeHook = async ({
  req,
  response,
}) => {...}
```

--------------------------------

### Payload CMS Join Field Data Structure Example

Source: https://payloadcms.com/docs/fields/join

Illustrates the structure of data returned by a Join Field, including `docs` for related documents, `hasNextPage` for pagination, and `totalDocs` when counting is enabled.

```JSON
{
  "id": "66e3431a3f23e684075aae9c",
  "relatedPosts": {
    "docs": [
      {
        "relationTo": "posts",
        "value": {
          "id": "66e3431a3f23e684075aaeb9",
          // other fields...
          "category": "66e3431a3f23e684075aae9c"
        }
      }
      // { ... }
    ],
    "hasNextPage": false,
    "totalDocs": 10 // if count: true is passed
  }
  // other fields...
}
```

--------------------------------

### Configure Payload CMS Collection with Custom Rich Text Elements and Leaves

Source: https://payloadcms.com/docs/rich-text/slate

Example TypeScript configuration for a Payload CMS collection (`ExampleCollection`) demonstrating how to define a `richText` field. It shows the integration of `slateEditor` and the specification of built-in and custom elements (e.g., 'cta') and leaves (e.g., 'highlight'), along with custom link fields and upload configurations.

```typescript
import type { CollectionConfig } from 'payload'

import { slateEditor } from '@payloadcms/richtext-slate'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'content', // required
      type: 'richText', // required
      defaultValue: [
        {
          children: [{ text: 'Here is some default content for this field' }],
        },
      ],
      required: true,
      editor: slateEditor({
        admin: {
          elements: [
            'h2',
            'h3',
            'h4',
            'link',
            'blockquote',
            {
              name: 'cta',
              Button: CustomCallToActionButton,
              Element: CustomCallToActionElement,
              plugins: [
                // any plugins that are required by this element go here
              ],
            },
          ],
          leaves: [
            'bold',
            'italic',
            {
              name: 'highlight',
              Button: CustomHighlightButton,
              Leaf: CustomHighlightLeaf,
              plugins: [
                // any plugins that are required by this leaf go here
              ],
            },
          ],
          link: {
            // Inject your own fields into the Link element
            fields: [
              {
                name: 'rel',
                label: 'Rel Attribute',
                type: 'select',
                hasMany: true,
                options: ['noopener', 'noreferrer', 'nofollow'],
              },
            ],
          },
          upload: {
            collections: {
              media: {
                fields: [
                  // any fields that you would like to save
                  // on an upload element in the `media` collection
                ],
              },
            },
          },
        },
      }),
    },
  ],
}
```

--------------------------------

### Payload GraphQL Configuration Options

Source: https://payloadcms.com/docs/graphql/overview

Table detailing the available options for configuring the GraphQL API within the Payload CMS main configuration, including custom mutations, queries, complexity limits, and GraphQL Playground settings.

```APIDOC
Option | Description
--- | ---
`mutations` | Any custom Mutations to be added in addition to what Payload provides.
`queries` | Any custom Queries to be added in addition to what Payload provides.
`maxComplexity` | A number used to set the maximum allowed complexity allowed by requests.
`disablePlaygroundInProduction` | A boolean that if false will enable the GraphQL playground, defaults to true.
`disable` | A boolean that if true will disable the GraphQL entirely, defaults to false.
`validationRules` | A function that takes the ExecutionArgs and returns an array of ValidationRules.
```

--------------------------------

### Extend Payload CMS Collections Using Spread Syntax

Source: https://payloadcms.com/docs/plugins/build-your-own

This example demonstrates how to add new collections to the Payload CMS configuration using the JavaScript spread syntax. It's crucial to spread the existing `config.collections` array first to ensure that no existing collections are lost when adding `newCollection`.

```TypeScript
config.collections = [
  ...(config.collections || []),
  newCollection,
  // Add additional collections here
]
```

--------------------------------

### usePayloadAPI Hook API Reference

Source: https://payloadcms.com/docs/admin/react-hooks

Comprehensive API documentation for the usePayloadAPI hook, detailing its arguments, options, and the structure of the returned response object and methods for interaction.

```APIDOC
usePayloadAPI(url: string, options?: object): [response: object, methods: object]\n\nArguments:\n  url: string\n    Description: The API endpoint to fetch data from. Relative URLs will be prefixed with the Payload API route.\n  options: object\n    Description: An object containing initial request parameters and initial state configuration.\n    Properties:\n      initialData: any\n        Description: Uses this data instead of making an initial request. If not provided, the request runs immediately.\n      initialParams: object\n        Description: Defines the initial parameters to use in the request. Defaults to an empty object {}.\n\nReturned Value (Array):\n  [0] response: object\n    Properties:\n      data: any\n        Description: The API response data.\n      isError: boolean\n        Description: A boolean indicating whether the request failed.\n      isLoading: boolean\n        Description: A boolean indicating whether the request is in progress.\n  [1] methods: object\n    Properties:\n      setParams: (params: object) => void\n        Description: Updates request parameters, triggering a refetch if needed.
```

--------------------------------

### Payload CMS me Hook Implementation

Source: https://payloadcms.com/docs/hooks/collections

Example TypeScript implementation of the `me` hook in Payload CMS. This hook allows overriding the default `me` operation behavior.

```TypeScript
import type { CollectionMeHook } from 'payload'

const meHook: CollectionMeHook = async ({
  args,
  user,
}) => {...}
```

--------------------------------

### Preventing Infinite Loops in Payload CMS afterChange Hook (Fixed Example)

Source: https://payloadcms.com/docs/hooks/context

This example demonstrates a robust solution to prevent infinite loops when performing document updates within an `afterChange` hook. By setting a flag (e.g., `triggerAfterChange: false`) in the `context` object during the update operation, the hook can identify and skip subsequent executions triggered by its own update, ensuring controlled flow.

```typescript
import type { CollectionConfig } from 'payload'

const MyCollection: CollectionConfig = {
  slug: 'slug',
  hooks: {
    afterChange: [
      async ({ context, doc, req }) => {
        // return if flag was previously set
        if (context.triggerAfterChange === false) {
          return
        }
        await req.payload.update({
          collection: contextHooksSlug,
          id: doc.id,
          data: {
            ...(await fetchCustomerData(data.customerID)),
          },
          context: {
            // set a flag to prevent from running again
            triggerAfterChange: false,
          },
        })
      },
    ],
  },
  fields: [
    /* ... */
  ],
}
```

--------------------------------

### Payload CMS: Configure Advanced Username Login Options

Source: https://payloadcms.com/docs/authentication/overview

This example shows how to provide more granular control over username login in Payload CMS. It allows configuring whether email login is still permitted (`allowEmailLogin`) and if an email address is required during user creation (`requireEmail`), offering flexibility for user authentication flows.

```JSON
{
  "slug": "customers",
  "auth": {
    "loginWithUsername": {
      "allowEmailLogin": true,
      "requireEmail": false
    }
  }
}
```

--------------------------------

### Payload API Response Example with Depth 0

Source: https://payloadcms.com/docs/queries/depth

Illustrates a Payload API response when `depth` is set to `0`, showing only the IDs of related documents without populating their full objects.

```JSON
{
  "id": "5ae8f9bde69e394e717c8832",
  "title": "This is a great post",
  "author": "5f7dd05cd50d4005f8bcab17"
}
```

--------------------------------

### Define Custom Component with Base Directory Mapping in Payload Config

Source: https://payloadcms.com/docs/custom-components/overview

This example shows how to configure a custom React component using `importMap` to set a base directory for component paths. This allows component paths to be relative to the specified base directory, simplifying configuration strings. It also demonstrates using `node:url` and `path` for dynamic directory resolution.

```javascript
import { buildConfig } from 'payload'
import { fileURLToPath } from 'node:url'
import path from 'path'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const config = buildConfig({
  // ...
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src')
    },
    components: {
      logout: {
        Button: '/components/Logout#MyComponent'
      }
    }
  }
})
```

--------------------------------

### Initialize PayloadCMS useListQuery Hook

Source: https://payloadcms.com/docs/admin/react-hooks

Demonstrates the basic initialization of the `useListQuery` hook to destructure `data` and `query` for use in a component.

```TypeScript
const { data, query } = useListQuery()
```

--------------------------------

### Configure Root Metadata in Payload Admin Panel

Source: https://payloadcms.com/docs/admin/metadata

Example configuration for setting up root-level metadata in the Payload Admin Panel, including title, description, and favicon icons. This configuration applies globally to all admin pages.

```JSON
{
  // ...
  admin: {
    meta: {
      title: 'My Admin Panel',
      description: 'The best admin panel in the world',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/favicon.png'
        }
      ]
    }
  }
}
```

--------------------------------

### Integrate RefreshRouteOnSave in Next.js App Router Page

Source: https://payloadcms.com/docs/live-preview/server

Example `page.tsx` file demonstrating how to import and render the `RefreshRouteOnSave` component within a Next.js App Router page, fetching data using Payload's local API and enabling live preview.

```typescript
import { RefreshRouteOnSave } from './RefreshRouteOnSave.tsx'
import { getPayload } from 'payload'
import config from '../payload.config'

export default async function Page() {
  const payload = await getPayload({ config })

  const page = await payload.findByID({
    collection: 'pages',
    id: '123',
    draft: true,
  })

  return (
    <Fragment>
      <RefreshRouteOnSave />
      <h1>{page.title}</h1>
    </Fragment>
  )
}
```

--------------------------------

### Dockerfile for Next.js Production Deployment with Payload CMS

Source: https://payloadcms.com/docs/production/deployment

This Dockerfile configures a production-ready Docker image for a Next.js application, optimized for Payload CMS. It sets up system users and groups, copies build artifacts, applies correct permissions for prerender cache, leverages Next.js output file tracing for smaller image sizes, and defines the application's entry point.

```Dockerfile
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
```

--------------------------------

### Payload Collection Configuration with a Text Field

Source: https://payloadcms.com/docs/fields/overview

This example demonstrates how to configure a Payload Collection with a simple 'text' field. It specifies the collection's slug and defines a field with a 'name' and 'type', illustrating a common way to add data fields.

```typescript
import type { CollectionConfig } from 'payload';

export const Page: CollectionConfig = {
  slug: 'pages',
  fields: [
    {
      name: 'field',
      type: 'text'
    }
  ]
};
```

--------------------------------

### Define Plugin Options Interface for Payload CMS

Source: https://payloadcms.com/docs/plugins/build-your-own

This TypeScript interface defines the structure for plugin options, which should be exported from the main plugin file. It includes JSDoc comments to describe each option, enhancing developer experience by providing inline documentation and type hints in editors. The example shows an optional `enabled` property with a default value.

```TypeScript
export interface PluginTypes {
  /**
   * Enable or disable plugin
   * @default false
   */
  enabled?: boolean
}
```

--------------------------------

### PayloadCMS Global `afterRead` Hook Implementation Example

Source: https://payloadcms.com/docs/hooks/globals

Illustrates a TypeScript implementation of the `GlobalAfterReadHook` for PayloadCMS. This hook runs as the final step before a global is returned, allowing for post-read processing using `doc`, `req`, and `findMany` arguments.

```TypeScript
import type { GlobalAfterReadHook } from 'payload'

const afterReadHook: GlobalAfterReadHook = async ({
doc,
req,
findMany,
}) => {...}
```

--------------------------------

### Payload CMS afterRefresh Hook Implementation

Source: https://payloadcms.com/docs/hooks/collections

Example TypeScript implementation of the `afterRefresh` hook in Payload CMS. This hook executes after a `refresh` operation for auth-enabled collections.

```TypeScript
import type { CollectionAfterRefreshHook } from 'payload';

const afterRefreshHook: CollectionAfterRefreshHook = async ({
  token,
}) => {...}
```

--------------------------------

### Payload Admin Panel Configuration Options

Source: https://payloadcms.com/docs/admin/overview

This API documentation outlines the available configuration options for the Payload Admin Panel, including settings for user avatars and automated login, with a brief description for each.

```APIDOC
Admin Options:
  avatar:
    Description: Set account profile picture. Options: `gravatar`, `default` or a custom React component.
  autoLogin:
    Description: Used to automate log-in for dev and demonstration convenience. More details: ../authentication/overview.
```

--------------------------------

### Create `beforeList` Client Component in React

Source: https://payloadcms.com/docs/custom-components/list-view

An example of a React client component for the `beforeList` injection point in Payload CMS. It uses `'use client'` directive, imports `BeforeListClientProps`, and renders a simple div.

```TypeScript
'use client'
import React from 'react'
import type { BeforeListClientProps } from 'payload'

export function MyBeforeListComponent(props: BeforeListClientProps) {
  return <div>This is a custom beforeList component (Client)</div>
}
```

--------------------------------

### Payload API Response Example with Depth 1

Source: https://payloadcms.com/docs/queries/depth

Illustrates a Payload API response when `depth` is set to `1`, showing the first level of populated related document details, such as the 'author' object.

```JSON
{
  "id": "5ae8f9bde69e394e717c8832",
  "title": "This is a great post",
  "author": {
    "id": "5f7dd05cd50d4005f8bcab17",
    "name": "John Doe"
  }
}
```

--------------------------------

### Payload CMS Stripe Plugin Configuration Options

Source: https://payloadcms.com/docs/plugins/stripe

Detailed documentation of the available options for configuring the Payload CMS Stripe plugin. This includes required parameters like `stripeSecretKey`, and optional settings for webhooks, REST proxying, data synchronization, and logging.

```APIDOC
stripePluginOptions:
  stripeSecretKey:
    type: string
    default: undefined
    required: true
    description: Your Stripe secret key
  stripeWebhooksEndpointSecret:
    type: string
    default: undefined
    required: false
    description: Your Stripe webhook endpoint secret
  rest:
    type: boolean
    default: false
    required: false
    description: When true, opens the /api/stripe/rest endpoint
  webhooks:
    type: object or function
    default: undefined
    required: false
    description: Either a function to handle all webhooks events, or an object of Stripe webhook handlers, keyed to the name of the event
  sync:
    type: array
    default: undefined
    required: false
    description: An array of sync configs
  logs:
    type: boolean
    default: false
    required: false
    description: When true, logs sync events to the console as they happen
```

--------------------------------

### Execute Payload Standalone Script with SWC Transpilation

Source: https://payloadcms.com/docs/local-api/outside-nextjs

This shell command demonstrates how to run a Payload standalone script using the `payload run` command with SWC transpilation enabled via the `--use-swc` flag. While SWC mode can offer faster execution, it requires `@swc-node/register` to be installed in your project and might occasionally encounter compatibility issues with certain imports.

```Shell
payload run src/seed.ts --use-swc
```

--------------------------------

### Payload CMS Admin-level Routes Configuration Options

Source: https://payloadcms.com/docs/admin/overview

API documentation outlining the configurable options for admin-level routes within the Payload CMS Admin Panel, such as `account`, `createFirstUser`, `login`, and `logout`, along with their default paths and descriptions.

```APIDOC
admin.routes:
  account:
    default: /account
    description: The user's account page.
  createFirstUser:
    default: /create-first-user
    description: The page to create the first user.
  forgot:
    default: /forgot
    description: The password reset page.
  inactivity:
    default: /logout-inactivity
    description: The page to redirect to after inactivity.
  login:
    default: /login
    description: The login page.
  logout:
    default: /logout
    description: The logout page.
  reset:
    default: /reset
    description: The password reset page.
  unauthorized:
    default: /unauthorized
    description: The unauthorized page.
```

--------------------------------

### Create a Basic Payload CMS Server Feature

Source: https://payloadcms.com/docs/rich-text/custom-features

This example shows the fundamental structure for creating a server-side feature using `createServerFeature` from `@payloadcms/richtext-lexical`. It defines a minimal feature with a unique `key`.

```TypeScript
import { createServerFeature } from '@payloadcms/richtext-lexical'

export const MyFeature = createServerFeature({
feature: {},
key: 'myFeature',
})
```

--------------------------------

### Generated TypeScript Interface from Extended Schema

Source: https://payloadcms.com/docs/typescript/generating-types

This is an example of the TypeScript interface that would be generated in your `payload-types.ts` file based on the custom JSON schema modification shown previously.

```typescript
export interface Test {
title: string
content: string
[k: string]: unknown
}
```

--------------------------------

### Configure SEO Plugin generateURL Function

Source: https://payloadcms.com/docs/plugins/seo

Provides an example of configuring the `generateURL` function in the PayloadCMS SEO plugin to construct a dynamic URL for a page based on its collection slug and document slug. This function uses the same arguments as `generateTitle`.

```typescript
{
// ...
seoPlugin({
generateURL: ({ doc, collectionSlug }) =>
`https://yoursite.com/${collectionSlug}/${doc?.slug}`,
})
}
```

--------------------------------

### Initialize Server-side Live Preview in React

Source: https://payloadcms.com/docs/live-preview/server

This React `useEffect` hook manages the lifecycle of server-side live preview. It registers a message event listener on the window for communication and sends an initial 'ready' message to the server. A cleanup function ensures the listener is removed when the component unmounts.

```JavaScript
useEffect(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('message', onMessage)
  }

  if (!hasSentReadyMessage.current) {
    hasSentReadyMessage.current = true

    ready({
      serverURL,
    })
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', onMessage)
    }
  }
}, [serverURL, onMessage, depth, apiRoute])
```

--------------------------------

### Payload CMS afterForgotPassword Hook Implementation

Source: https://payloadcms.com/docs/hooks/collections

Example TypeScript implementation of the `afterForgotPassword` hook in Payload CMS. This hook executes after a successful `forgotPassword` operation for auth-enabled collections.

```TypeScript
import type { CollectionAfterForgotPasswordHook } from 'payload'

const afterForgotPasswordHook: CollectionAfterForgotPasswordHook = async ({
  args,
  context,
  collection,
}) => {...}
```

--------------------------------

### Proxy Stripe API Calls via Payload's `stripeProxy` (Server-side)

Source: https://payloadcms.com/docs/plugins/stripe

This example shows an alternative server-side method for interacting with the Stripe API using Payload's `stripeProxy` function. It simplifies the API call by abstracting the Stripe client initialization and allows specifying the Stripe method and arguments directly. This function mirrors the behavior of the client-side `/api/stripe/rest` endpoint.

```TypeScript
import { stripeProxy } from '@payloadcms/plugin-stripe'

export const MyFunction = async () => {
  try {
    const customer = await stripeProxy({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeMethod: 'customers.create',
      stripeArgs: [
        {
          email: data.email
        }
      ]
    })

    if (customer.status === 200) {
      // do something...
    }

    if (customer.status >= 400) {
      throw new Error(customer.message)
    }
  } catch (error) {
    console.error(error.message)
  }
}
```

--------------------------------

### Google Cloud Storage Adapter Configuration Options

Source: https://payloadcms.com/docs/upload/storage-adapters

Reference documentation for the configuration options available when setting up the Google Cloud Storage adapter in Payload CMS. It details each option's purpose and default value.

```APIDOC
Option: enabled
  Description: Whether or not to enable the plugin
  Default: true

Option: collections
  Description: Collections to apply the storage to
  Default: 

Option: bucket
  Description: The name of the bucket to use
  Default: 

Option: options
  Description: Google Cloud Storage client configuration. See [Docs](https://github.com/googleapis/nodejs-storage)
  Default: 

Option: acl
  Description: Access control list for files that are uploaded
  Default: Private

Option: clientUploads
  Description: Do uploads directly on the client to bypass limits on Vercel.
  Default: 
```

--------------------------------

### Payload CMS refresh Hook Implementation

Source: https://payloadcms.com/docs/hooks/collections

Example TypeScript implementation of the `refresh` hook in Payload CMS. This hook allows overriding the default `refresh` operation behavior.

```TypeScript
import type { CollectionRefreshHook } from 'payload'

const myRefreshHook: CollectionRefreshHook = async ({
  args,
  user,
}) => {...}
```

--------------------------------

### Implement a Client-Side beforeListTable Component for Payload

Source: https://payloadcms.com/docs/custom-components/list-view

Example of a React client component for Payload CMS's `beforeListTable` property. It uses the `'use client'` directive and receives `BeforeListTableClientProps`.

```TypeScript
'use client'
import React from 'react'
import type { BeforeListTableClientProps } from 'payload'

export function MyBeforeListTableComponent(props: BeforeListTableClientProps) {
  return <div>This is a custom beforeListTable component (Client)</div>
}
```

--------------------------------

### Create Custom TextField Component with useField Hook

Source: https://payloadcms.com/docs/fields/overview

Example of a custom React component for a PayloadCMS field, demonstrating how to use the `useField` hook from `@payloadcms/ui` to manage the field's value by sending and receiving it from the form.

```tsx
'use client'

import { useField } from '@payloadcms/ui'

export const CustomTextField: React.FC = () => {
  const { value, setValue } = useField()

  return <input onChange={(e) => setValue(e.target.value)} value={value} />
}
```

--------------------------------

### Create a Server-Side Collection Description Component for Payload

Source: https://payloadcms.com/docs/custom-components/list-view

Example of a React server component that can be used as a custom collection description in Payload CMS. It receives `ViewDescriptionServerProps` and renders custom content.

```TypeScript
import React from 'react'
import type { ViewDescriptionServerProps } from 'payload'

export function MyDescriptionComponent(props: ViewDescriptionServerProps) {
  return <div>This is a custom Collection description component (Server)</div>
}
```

--------------------------------

### Configure SEO Plugin generateTitle Function

Source: https://payloadcms.com/docs/plugins/seo

Demonstrates how to configure the `generateTitle` function within the PayloadCMS SEO plugin to dynamically generate the meta title for documents. This example constructs a title using a static prefix and the document's `title` property.

```typescript
{
// ...
seoPlugin({
generateTitle: ({ doc }) => `Website.com — ${doc?.title}`,
})
}
```

--------------------------------

### Basic Payload Configuration File Structure

Source: https://payloadcms.com/docs/configuration/overview

This snippet illustrates the minimal structure of a `payload.config.ts` file, which serves as the central configuration entry point for any Payload CMS application. It imports the `buildConfig` function from the `payload` library and exports its result, providing a foundational template for further configuration.

```TypeScript
import { buildConfig } from 'payload'

export default buildConfig({
  // Your config goes here
})
```

--------------------------------

### Implement a Client-Side afterList Component for Payload

Source: https://payloadcms.com/docs/custom-components/list-view

Example of a React client component for Payload CMS's `afterList` property. It uses the `'use client'` directive and receives `AfterListClientProps`.

```TypeScript
'use client'
import React from 'react'
import type { AfterListClientProps } from 'payload'

export function MyAfterListComponent(props: AfterListClientProps) {
  return <div>This is a custom afterList component (Client)</div>
}
```

--------------------------------

### Integrate and Customize Features in Lexical Editor

Source: https://payloadcms.com/docs/rich-text/overview

An advanced example demonstrating how to integrate and customize various features like LinkFeature, UploadFeature, and BlocksFeature within the Lexical editor's configuration. It includes adding custom fields for links and uploads, and reusing Payload blocks directly within the editor.

```TypeScript
import {
  BlocksFeature,
  LinkFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { Banner } from '../blocks/Banner'
import { CallToAction } from '../blocks/CallToAction'

{
  editor: lexicalEditor({
    features: ({ defaultFeatures, rootFeatures }) => [
      ...defaultFeatures,
      LinkFeature({
        // Example showing how to customize the built-in fields
        // of the Link feature
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'rel',
            label: 'Rel Attribute',
            type: 'select',
            hasMany: true,
            options: ['noopener', 'noreferrer', 'nofollow'],
            admin: {
              description:
                'The rel attribute defines the relationship between a linked resource and the current document. This is a custom link field.',
            },
          },
        ],
      }),
      UploadFeature({
        collections: {
          uploads: {
            // Example showing how to customize the built-in fields
            // of the Upload feature
            fields: [
              {
                name: 'caption',
                type: 'richText',
                editor: lexicalEditor(),
              },
            ],
          },
        },
      }),
      // This is incredibly powerful. You can re-use your Payload blocks
      // directly in the Lexical editor as follows:
      BlocksFeature({
        blocks: [Banner, CallToAction],
      }),
    ],
  })
}
```

--------------------------------

### Create a Server-Side beforeListTable Component for Payload

Source: https://payloadcms.com/docs/custom-components/list-view

Example of a React server component that can be used with Payload CMS's `beforeListTable` property. It receives `BeforeListTableServerProps` and renders custom content.

```TypeScript
import React from 'react'
import type { BeforeListTableServerProps } from 'payload'

export function MyBeforeListTableComponent(props: BeforeListTableServerProps) {
  return <div>This is a custom beforeListTable component (Server)</div>
}
```

--------------------------------

### Payload GraphQL Queries for User Preferences

Source: https://payloadcms.com/docs/graphql/overview

Table listing the automatically generated GraphQL query available for user preferences, specifically the `findOne` operation.

```APIDOC
Query Name | Operation
--- | ---
`Preference` | `findOne`
```

--------------------------------

### Implement a Client-Side Collection Description Component for Payload

Source: https://payloadcms.com/docs/custom-components/list-view

Example of a React client component for Payload CMS's custom collection description. It uses the `'use client'` directive and receives `ViewDescriptionClientProps`.

```TypeScript
'use client'
import React from 'react'
import type { ViewDescriptionClientProps } from 'payload'

export function MyDescriptionComponent(props: ViewDescriptionClientProps) {

```

--------------------------------

### Define Payload Migration Up and Down Functions

Source: https://payloadcms.com/docs/database/migrations

This example illustrates the standard structure of a Payload migration file in TypeScript. It includes `up` and `down` functions, which are executed for applying and reverting database changes, respectively. These functions receive `payload` and `req` arguments, enabling interaction with the Payload API and transactional context.

```TypeScript
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/your-db-adapter'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // Perform changes to your database here.
  // You have access to `payload` as an argument, and
  // everything is done in TypeScript.
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  // Do whatever you need to revert changes if the `up` function fails
}
```

--------------------------------

### Configure Payload CMS for Vercel Content Link

Source: https://payloadcms.com/docs/integrations/vercel-content-link

Integrate the `contentSourceMaps` plugin into your Payload configuration. This example demonstrates how to import the plugin and enable Content Source Maps for specific collections, such as 'pages', by listing them in the plugin's `collections` array. This step is crucial for Payload to embed the necessary source map data in its API responses.

```typescript
import { buildConfig } from "payload/config"
import contentSourceMaps from "@payloadcms/plugin-csm"

const config = buildConfig({
  collections: [
    {
      slug: "pages",
      fields: [
        {
          name: 'slug',
          type: 'text',
        },
        {
          name: 'title,'
          type: 'text',
        },
      ],
    },
  ],
  plugins: [
    contentSourceMaps({
      collections: ["pages"],
    }),
  ],
})

export default config
```

--------------------------------

### Create a Server-Side afterList Component for Payload

Source: https://payloadcms.com/docs/custom-components/list-view

Example of a React server component that can be used with Payload CMS's `afterList` property. It receives `AfterListServerProps` and renders custom content.

```TypeScript
import React from 'react'
import type { AfterListServerProps } from 'payload'

export function MyAfterListComponent(props: AfterListServerProps) {
  return <div>This is a custom afterList component (Server)</div>
}
```

--------------------------------

### Create Custom beforeDocumentControls React Server Component

Source: https://payloadcms.com/docs/custom-components/edit-view

An example of a custom component rendered before document controls, implemented as a React Server Component. It receives `BeforeDocumentControlsServerProps` and can display any custom UI element.

```typescript
import React from 'react'
import type { BeforeDocumentControlsServerProps } from 'payload'

export function MyCustomDocumentControlButton(
  props: BeforeDocumentControlsServerProps,
) {
  return <div>This is a custom beforeDocumentControl button (Server)</div>
}
```

--------------------------------

### Configure Lexical Editor in Payload Root Config

Source: https://payloadcms.com/docs/rich-text/overview

Example demonstrating how to integrate the Lexical editor into the top-level Payload configuration, making it the default rich text editor for all rich text fields unless overridden.

```TypeScript
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export default buildConfig({
  collections: [
    // your collections here
  ],
  // Pass the Lexical editor to the root config
  editor: lexicalEditor({}),
})
```

--------------------------------

### Overview of All Collection Lifecycle Hooks in Payload CMS

Source: https://payloadcms.com/docs/hooks/collections

This example provides a comprehensive list of all available Collection Hooks in Payload CMS. It categorizes hooks by their execution phase (e.g., `beforeOperation`, `afterChange`) and includes authentication-specific hooks. Each hook accepts an array of synchronous or asynchronous functions, allowing for flexible custom logic.

```TypeScript
import type { CollectionConfig } from 'payload';

export const CollectionWithHooks: CollectionConfig = {
  // ...
  hooks: {
    beforeOperation: [(args) => {...}],
    beforeValidate: [(args) => {...}],
    beforeDelete: [(args) => {...}],
    beforeChange: [(args) => {...}],
    beforeRead: [(args) => {...}],
    afterChange: [(args) => {...}],
    afterRead: [(args) => {...}],
    afterDelete: [(args) => {...}],
    afterOperation: [(args) => {...}],
    afterError: [(args) => {....}],

    // Auth-enabled Hooks
    beforeLogin: [(args) => {...}],
    afterLogin: [(args) => {...}],
    afterLogout: [(args) => {...}],
    afterRefresh: [(args) => {...}],
    afterMe: [(args) => {...}],
    afterForgotPassword: [(args) => {...}],
    refresh: [(args) => {...}],
    me: [(args) => {...}]
  }
}
```

--------------------------------

### Example Implementation of Global beforeRead Hook

Source: https://payloadcms.com/docs/hooks/globals

This snippet shows a partial asynchronous implementation of a `beforeRead` hook. This hook executes before a global document is transformed for output by `afterRead`, providing access to all locales and hidden fields via the `doc` argument. It also receives the `req` object.

```TypeScript
import type { GlobalBeforeReadHook } from 'payload'

const beforeReadHook: GlobalBeforeReadHook = async ({
doc,
req,

```

--------------------------------

### Retrieve Default Lexical Editor Config

Source: https://payloadcms.com/docs/rich-text/converters

To obtain the default Lexical editor configuration, use the `default` method of `editorConfigFactory`, passing your Payload `config` object. This provides the standard setup without custom features.

```TypeScript
const defaultEditorConfig = await editorConfigFactory.default({ config })
```

--------------------------------

### Configure Icons for Payload Admin Panel

Source: https://payloadcms.com/docs/admin/metadata

Example configuration for specifying various icon types, such as favicon and Apple touch icons, within the `admin.meta.icons` array in the Payload Admin Panel configuration.

```JSON
{
  // ...
  admin: {
    meta: {
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/favicon.png'
        },
        {
          rel: 'apple-touch-icon',
          type: 'image/png',
          url: '/apple-touch-icon.png'
        }
      ]
    }
  }
}
```

--------------------------------

### API Documentation: usePayloadAPI Hook

Source: https://payloadcms.com/docs/admin/react-hooks

Documentation for the `usePayloadAPI` hook, which likely provides methods for interacting with the Payload CMS API.

```APIDOC
usePayloadAPI()
```

--------------------------------

### Payload Admin Components Configuration Options Reference

Source: https://payloadcms.com/docs/custom-components/root-components

This API documentation details the various properties available under the `admin.components` object in Payload CMS. Each property represents a specific injection point or customizable element within the Admin Panel, allowing developers to integrate custom React components.

```APIDOC
admin.components:
  actions: Array<string> - An array of Custom Components to be rendered *within* the header of the Admin Panel, providing additional interactivity and functionality.
  afterDashboard: Array<string> - An array of Custom Components to inject into the built-in Dashboard, *after* the default dashboard contents.
  afterLogin: Array<string> - An array of Custom Components to inject into the built-in Login, *after* the default login form.
  afterNavLinks: Array<string> - An array of Custom Components to inject into the built-in Nav, *after* the links.
  beforeDashboard: Array<string> - An array of Custom Components to inject into the built-in Dashboard, *before* the default dashboard contents.
  beforeLogin: Array<string> - An array of Custom Components to inject into the built-in Login, *before* the default login form.
  beforeNavLinks: Array<string> - An array of Custom Components to inject into the built-in Nav, *before* the links themselves.
  graphics.Icon: React.ComponentType - The simplified logo used in contexts like the `Nav` component.
  graphics.Logo: React.ComponentType - The full logo used in contexts like the `Login` view.
  header: Array<string> - An array of Custom Components to be injected above the Payload header.
  logout.Button: React.ComponentType - The button displayed in the sidebar that logs the user out.
  Nav: React.ComponentType - Contains the sidebar / mobile menu in its entirety.
  providers: Array<React.ComponentType> - Custom React Context providers that will wrap the entire Admin Panel.
  views: Object - Override or create new views within the Admin Panel.
```

--------------------------------

### Implement a Client-Side afterListTable Component for Payload

Source: https://payloadcms.com/docs/custom-components/list-view

Example of a React client component for Payload CMS's `afterListTable` property. It uses the `'use client'` directive and receives `AfterListTableClientProps`.

```TypeScript
'use client'
import React from 'react'
import type { AfterListTableClientProps } from 'payload'

export function MyAfterListTableComponent(props: AfterListTableClientProps) {
  return <div>This is a custom afterListTable component (Client)</div>
}
```

--------------------------------

### Payload REST API Query String Example

Source: https://payloadcms.com/docs/queries/overview

Illustrates a basic REST API query string for filtering data in Payload CMS. This URL queries the 'posts' endpoint to find documents where the 'color' field equals 'mint'.

```HTTP
https://localhost:3000/api/posts?where[color][equals]=mint
```

--------------------------------

### Enable Basic Authentication on a Payload Collection

Source: https://payloadcms.com/docs/authentication/overview

This snippet demonstrates the simplest way to enable authentication for a Payload Collection by setting the `auth` property to `true` in its configuration. This provides default authentication behavior, including user login, logout, and password reset functionalities, making it a good starting point for most applications.

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  // ...
  auth: true,
}
```

--------------------------------

### Implement `afterError` Root Hook

Source: https://payloadcms.com/docs/hooks/overview

This example illustrates how to implement the `afterError` root hook in Payload. This asynchronous hook is triggered when an application error occurs, providing access to the `error` object for custom error handling, logging, or transformation.

```TypeScript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  hooks: {
    afterError: [
      async ({ error }) => {
        // Do something
      }
    ]
  }
})
```

--------------------------------

### Create a Server-Side afterListTable Component for Payload

Source: https://payloadcms.com/docs/custom-components/list-view

Example of a React server component that can be used with Payload CMS's `afterListTable` property. It receives `AfterListTableServerProps` and renders custom content.

```TypeScript
import React from 'react'
import type { AfterListTableServerProps } from 'payload'

export function MyAfterListTableComponent(props: AfterListTableServerProps) {
  return <div>This is a custom afterListTable component (Server)</div>
}
```

--------------------------------

### Payload-Wide Upload Options (Busboy Configuration)

Source: https://payloadcms.com/docs/upload/overview

Global configuration options for file uploads in Payload CMS, leveraging Busboy properties for advanced control over file handling, including size limits, temporary file management, and filename processing.

```APIDOC
Payload-Wide Upload Options (Busboy):
  abortOnLimit: Boolean. If true, returns HTTP 413 if a file exceeds the file size limit. If false, the file is truncated. Defaults to false.
  createParentPath: Boolean. Set to true to automatically create a directory path when moving files from a temporary directory or buffer. Defaults to false.
  debug: Boolean. Turns upload process logging on if true, or off if false. Useful for troubleshooting. Defaults to false.
  limitHandler: Function. A function which is invoked if the file is greater than configured limits.
  parseNested: Boolean. Set to true to turn req.body and req.files into nested structures. By default req.body and req.files are flat objects. Defaults to false.
  preserveExtension: Boolean or Number. Preserves file extensions with the safeFileNames option. Limits file names to 3 characters if true or a custom length if a number, trimming from the start of the extension.
  responseOnLimit: String. A string that is sent in the Response to a client if the file size limit is exceeded when used with abortOnLimit.
  safeFileNames: Boolean or Regex. Set to true to strip non-alphanumeric characters except dashes and underscores. Can also be set to a regex to determine what to strip. Defaults to false.
  tempFileDir: String. A string path to store temporary files used when the useTempFiles option is set to true. Defaults to './tmp'.
  uploadTimeout: Number. Defines how long to wait for data before aborting, specified in milliseconds. Set to 0 to disable timeout checks. Defaults to 60000.
  uriDecodeFileNames: Boolean. Set to true to apply uri decoding to file names. Defaults to false.
  useTempFiles: Boolean. Set to true to store files to a temporary directory instead of in RAM, reducing memory usage for large files or many files.
```

--------------------------------

### Configure Open Graph Metadata for Payload Admin Panel

Source: https://payloadcms.com/docs/admin/metadata

Example configuration for setting Open Graph metadata, including description, images, site name, and title, within the `admin.meta.openGraph` property for social media sharing.

```JSON
{
  // ...
  admin: {
    meta: {
      openGraph: {
        description: 'The best admin panel in the world',
        images: [
          {
            url: 'https://example.com/image.jpg',
            width: 800,
            height: 600
          }
        ],
        siteName: 'Payload',
        title: 'My Admin Panel'
      }
    }
  }
}
```

--------------------------------

### PayloadCMS Local API: Update Multiple Documents

Source: https://payloadcms.com/docs/local-api/overview

Example of updating multiple documents in a PayloadCMS collection based on a `where` query using the Local API's `update` method. It shows how to specify the collection, query criteria, and the data to update for bulk operations.

```JavaScript
// Result will be an object with:
// {
// docs: [], // each document that was updated
// errors: [], // each error also includes the id of the document
// }
const result = await payload.update({
  collection: 'posts', // required
  where: {
    // required
    fieldName: { equals: 'value' }
  },
  data: {
    // required
    title: 'sure',
    description: 'maybe'
  },
  depth: 0,
  locale: 'en'
})
```

--------------------------------

### Import and Initialize Payload Object

Source: https://payloadcms.com/docs/local-api/overview

Illustrates how to import and initialize the 'payload' object using 'getPayload' when it's not available through function arguments or the 'req' object. This method is suitable for standalone scripts or contexts where Payload needs to be explicitly instantiated.

```TypeScript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
```

--------------------------------

### Implement Payload Tabs Field in a Collection

Source: https://payloadcms.com/docs/fields/tabs

This TypeScript example demonstrates how to integrate a Tabs field into a Payload Collection configuration, showcasing the definition of multiple tabs with nested fields, labels, and names, and how data is accessed.

```TypeScript
import type { CollectionConfig } from 'payload';

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      type: 'tabs', // required
      tabs: [
        // required
        {
          label: 'Tab One Label', // required
          description: 'This will appear within the tab above the fields.',
          fields: [
            // required
            {
              name: 'someTextField',
              type: 'text',
              required: true
            }
          ]
        },
        {
          name: 'tabTwo',
          label: 'Tab Two Label', // required
          interfaceName: 'TabTwo', // optional (`name` must be present)
          fields: [
            // required
            {
              name: 'numberField', // accessible via tabTwo.numberField
              type: 'number',
              required: true
            }
          ]
        }
      ]
    }
  ]
};
```

--------------------------------

### Optimizing Payload Blocks with Block References

Source: https://payloadcms.com/docs/fields/blocks

This configuration example demonstrates how to define blocks once and then reference them by slug across multiple collections or rich text editors in Payload CMS. This approach optimizes performance by reducing data duplication and improving server-side processing efficiency.

```typescript
import { buildConfig } from 'payload'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'

// Payload Config
const config = buildConfig({
  // Define the block once
  blocks: [
    {
      slug: 'TextBlock',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
      ],
    },
  ],
  collections: [
    {
      slug: 'collection1',
      fields: [
        {
          name: 'content',
          type: 'blocks',
          // Reference the block by slug
          blockReferences: ['TextBlock'],
          blocks: [], // Required to be empty, for compatibility reasons
        },
      ],
    },
    {
      slug: 'collection2',
      fields: [
        {
          name: 'editor',
          type: 'richText',
          editor: lexicalEditor({
            features: [
              BlocksFeature({
                // Same reference can be reused anywhere, even in the lexical editor, without incurred performance hit
                blocks: ['TextBlock'],
              }),
            ],
          }),
        },
      ],
    },
  ],
})
```

--------------------------------

### Configure Payload Collection with Autosave

Source: https://payloadcms.com/docs/versions/autosave

This TypeScript example demonstrates how to enable the autosave feature for a Payload collection. It shows setting `versions.drafts.autosave` to `true` for basic functionality and includes commented-out code illustrating how to customize autosave properties like `interval` and `showSaveDraftButton` using an object configuration.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: ({ req }) => {
      // If there is a user logged in,
      // let them retrieve all documents
      if (req.user) return true

      // If there is no user,
      // restrict the documents that are returned
      // to only those where `_status` is equal to `published`
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  versions: {
    drafts: {
      autosave: true,

      // Alternatively, you can specify an object to customize autosave:
      // autosave: {
      // Define how often the document should be autosaved (in milliseconds)
      // interval: 1500,
      //
      // Show the "Save as draft" button even while autosave is enabled
      // showSaveDraftButton: true,
      // },
    },
  },
  //.. the rest of the Pages config here
}
```

--------------------------------

### Example Custom Server-Side Edit View Component (React)

Source: https://payloadcms.com/docs/custom-components/edit-view

A basic React component illustrating a custom server-side Edit View for Payload CMS. It receives `DocumentViewServerProps` and renders a simple div.

```TypeScript
import React from 'react'
import type { DocumentViewServerProps } from 'payload'

export function MyCustomServerEditView(props: DocumentViewServerProps) {
  return <div>This is a custom Edit View (Server)</div>
}
```

--------------------------------

### Direct Stripe API Interaction (Server-side)

Source: https://payloadcms.com/docs/plugins/stripe

This snippet demonstrates how to interact directly with the Stripe API on the server-side using the official `stripe` npm module. It covers initializing the Stripe client with a secret key and API version, then performing an API call, such as creating a customer. This is the recommended approach for server-side operations.

```TypeScript
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-08-01'
})

export const MyFunction = async () => {
  try {
    const customer = await stripe.customers.create({
      email: data.email
    })

    // do something...
  } catch (error) {
    console.error(error.message)
  }
}
```

--------------------------------

### Create Custom Slate Node Converter for Uploads

Source: https://payloadcms.com/docs/rich-text/migration

This example demonstrates how to define a custom `SlateNodeConverter` for a specific Slate node type, using an 'upload' node as an illustration. The converter takes a Slate node as input and transforms it into the corresponding Lexical node structure, ensuring custom data types are correctly migrated. The `nodeTypes` array specifies which Slate nodes this converter can handle.

```typescript
import type { SerializedUploadNode } from '../uploadNode'
import type { SlateNodeConverter } from '@payloadcms/richtext-lexical'

export const SlateUploadConverter: SlateNodeConverter = {
  converter({ slateNode }) {
    return {
      fields: {
        ...slateNode.fields,
      },
      format: '',
      relationTo: slateNode.relationTo,
      type: 'upload',
      value: {
        id: slateNode.value?.id || '',
      },
      version: 1,
    } as const as SerializedUploadNode
  },
  nodeTypes: ['upload'],
}
```

--------------------------------

### Fetch Data with Payload Local API in React Server Component

Source: https://payloadcms.com/docs/getting-started/concepts

This example demonstrates how to use Payload's Local API to fetch data within a React Server Component. The Local API provides direct-to-database access, offering strong typing and high performance for server-side operations. It shows how to initialize Payload and retrieve documents from a collection, with full TypeScript support for the returned data.

```TypeScript
import React from 'react'
import config from '@payload-config'
import { getPayload } from 'payload'

const MyServerComponent: React.FC = () => {
  const payload = await getPayload({ config })

  // The `findResult` here will be fully typed as `PaginatedDocs<Page>`,
  // where you will have the `docs` that are returned as well as
  // information about how many items are returned / are available in total / etc
  const findResult = await payload.find({ collection: 'pages' })

  return (
    <ul>
      {findResult.docs.map((page) => {
        // Render whatever here!
        // The `page` is fully typed as your Pages collection!
      })}
    </ul>
  )
}
```

--------------------------------

### Configure Redirects Plugin with Advanced Options

Source: https://payloadcms.com/docs/plugins/redirects

Example demonstrating advanced configuration of the `redirectsPlugin`. This includes overriding default fields in the `redirects` collection to add custom fields, specifying supported redirect types (e.g., '301', '302'), and customizing the redirect type field's label.

```typescript
redirectsPlugin({
  collections: ['pages'],
  overrides: {
    fields: ({ defaultFields }) => {
      return [
        ...defaultFields,
        {
          type: 'text',
          name: 'customField',
        },
      ]
    },
  },
  redirectTypes: ['301', '302'],
  redirectTypeFieldOverride: {
    label: 'Redirect Type (Overridden)',
  },
})
```

--------------------------------

### Configure Live Preview URL with Request Data

Source: https://payloadcms.com/docs/live-preview/overview

This snippet demonstrates how to construct a fully qualified URL for the live preview using properties from the request object (`req`). This approach is particularly useful for environments like Vercel where frontend URLs might be unknown at build-time, allowing Payload to dynamically build the absolute URL.

```JavaScript
url: ({ data, req }) => `${req.protocol}//${req.host}/${data.slug}`
```

--------------------------------

### Import Core Payload TypeScript Types

Source: https://payloadcms.com/docs/getting-started/concepts

This TypeScript snippet shows how to import common type definitions from the `payload` package. These types, such as `Config`, `CollectionConfig`, `GlobalConfig`, and `Field`, are essential for type-safe development when configuring Payload CMS. This requires the `payload` package to be installed.

```TypeScript
import { Config, CollectionConfig, GlobalConfig, Field } from 'payload'
```

--------------------------------

### Send Email using Payload CMS `sendEmail` Method

Source: https://payloadcms.com/docs/email/overview

This example shows how to programmatically send an email using the `payload.sendEmail` method. It specifies the recipient, subject, and message body (text or HTML).

```JavaScript
const email = await payload.sendEmail({
  to: 'test@example.com',
  subject: 'This is a test email',
  text: 'This is my message body',
})
```

--------------------------------

### Multi-stage Dockerfile for Payload CMS Production Build

Source: https://payloadcms.com/docs/production/deployment

This multi-stage Dockerfile provides a robust solution for building and deploying a Payload CMS application in a production environment. It optimizes the build process by separating dependency installation and application building into distinct stages, supporting various package managers (yarn, npm, pnpm) and resulting in a smaller, more efficient production image. Environment variables like PAYLOAD_SECRET, PAYLOAD_CONFIG_PATH, and DATABASE_URI should be set during deployment.

```Dockerfile
# Dockerfile
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
elif [ -f package-lock.json ]; then npm ci; \
elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
else echo "Lockfile not found." && exit 1; \
fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
if [ -f yarn.lock ]; then yarn run build; \
elif [ -f package-lock.json ]; then npm run build; \
elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
else echo "Lockfile not found." && exit 1; \
fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
```

--------------------------------

### Create Custom List View Server Component in React

Source: https://payloadcms.com/docs/custom-components/list-view

An example of a React server component that can be used as a custom List View in Payload CMS. It imports `ListViewServerProps` and renders a simple div.

```TypeScript
import React from 'react'
import type { ListViewServerProps } from 'payload'
import { DefaultListView } from '@payloadcms/ui'

export function MyCustomServerListView(props: ListViewServerProps) {
  return <div>This is a custom List View (Server)</div>
}
```

--------------------------------

### Implement Collection-Level Access Control for Query Presets

Source: https://payloadcms.com/docs/query-presets/overview

This example demonstrates how to apply collection-level access control to all Query Presets, ensuring that only users with the 'admin' role can read or update them. This static rule is defined within the `queryPresets.access` property of the Payload configuration.

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  queryPresets: {
    // ...
    access: {
      read: ({ req: { user } }) =>
        user ? user?.roles?.some((role) => role === 'admin') : false,
      update: ({ req: { user } }) =>
        user ? user?.roles?.some((role) => role === 'admin') : false,
    },
  },
})
```

--------------------------------

### Set Static Field Description in Payload CMS Admin

Source: https://payloadcms.com/docs/fields/overview

This TypeScript example shows how to configure a static string description for a field using the `admin.description` property within a Payload CMS `CollectionConfig`, providing simple helper text to editors.

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollectionConfig: CollectionConfig = {
// ...
fields: [
// ...
{
name: 'myField',
type: 'text',
admin: {
description: 'Hello, world!',
},
},
],
}
```

--------------------------------

### Fetch Data with usePayloadAPI Hook in React

Source: https://payloadcms.com/docs/admin/react-hooks

This example demonstrates how to integrate the usePayloadAPI hook within a React component to fetch data from a Payload CMS API endpoint. It shows handling loading and error states, and how to use setParams to trigger a data refresh.

```tsx
'use client'\nimport { usePayloadAPI } from '@payloadcms/ui'\n\nconst MyComponent: React.FC = () => {\n  // Fetch data from a collection item using its ID\n  const [{ data, isError, isLoading }, { setParams }] = usePayloadAPI(\n    '/api/posts/123',\n    {\n      initialParams: { depth: 1 },\n    },\n  )\n\n  if (isLoading) return <p>Loading...</p>\n  if (isError) return <p>Error occurred while fetching data.</p>\n\n  return (\n    <div>\n      <h1>{data?.title}</h1>\n      <button onClick={() => setParams({ cacheBust: Date.now() })}>\n        Refresh Data\n      </button>\n    </div>\n  )\n}
```

--------------------------------

### Example Payload Collection with Checkbox Field

Source: https://payloadcms.com/docs/fields/checkbox

Demonstrates how to integrate a checkbox field within a Payload CMS collection configuration, showcasing common properties like `name`, `type`, `label`, and `defaultValue` for practical implementation.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'enableCoolStuff', // required
      type: 'checkbox', // required
      label: 'Click me to see fanciness',
      defaultValue: false,
    },
  ],
}
```

--------------------------------

### Payload CMS Local API: Find Collection Versions

Source: https://payloadcms.com/docs/versions/overview

Example of using the Payload CMS Local API `payload.findVersions` method to query and retrieve a paginated set of versions for a specific collection. Demonstrates various parameters like `collection`, `depth`, `page`, `limit`, `where`, `sort`, `locale`, and access control options.

```JavaScript
const result = await payload.findVersions({
  collection: 'posts', // required
  depth: 2,
  page: 1,
  limit: 10,
  where: {}, // pass a `where` query here
  sort: '-createdAt',
  locale: 'en',
  fallbackLocale: false,
  user: dummyUser,
  overrideAccess: false,
  showHiddenFields: true,
})
```

--------------------------------

### Payload REST API Query String Generation with qs-esm

Source: https://payloadcms.com/docs/queries/overview

Demonstrates how to use the `qs-esm` package in TypeScript to programmatically construct complex query strings for the Payload REST API from a JSON object. This example builds a query for posts where 'color' equals 'mint' and then fetches the data.

```TypeScript
import { stringify } from 'qs-esm'
import type { Where } from 'payload'

const query: Where = {
  color: {
    equals: 'mint',
  },
  // This query could be much more complex
  // and qs-esm would handle it beautifully
}

const getPosts = async () => {
  const stringifiedQuery = stringify(
    {
      where: query, // ensure that `qs-esm` adds the `where` property, too!
    },
    { addQueryPrefix: true },
  )

  const response = await fetch(
    `http://localhost:3000/api/posts${stringifiedQuery}`,
  )
  // Continue to handle the response below...
}
```

--------------------------------

### Integrate `useLivePreview` Hook in React Component

Source: https://payloadcms.com/docs/live-preview/client

Demonstrates how to use the `useLivePreview` hook from `@payloadcms/live-preview-react` within a React client component. It illustrates importing the hook, passing initial data and configuration, and rendering the live data that updates in real-time.

```typescript
'use client'
import { useLivePreview } from '@payloadcms/live-preview-react'
import { Page as PageType } from '@/payload-types'

// Fetch the page in a server component, pass it to the client component, then thread it through the hook
// The hook will take over from there and keep the preview in sync with the changes you make
// The `data` property will contain the live data of the document
export const PageClient: React.FC<{
  page: {
    title: string
  }
}> = ({ page: initialPage }) => {
  const { data } = useLivePreview<PageType>({
    initialData: initialPage,
    serverURL: PAYLOAD_SERVER_URL,
    depth: 2,
  })

  return <h1>{data.title}</h1>
}
```

--------------------------------

### Configure Google Cloud Storage Adapter in Payload CMS

Source: https://payloadcms.com/docs/upload/storage-adapters

This example demonstrates how to integrate and configure the Google Cloud Storage adapter within a Payload CMS `buildConfig`. It specifies which collections should use GCS and sets essential parameters like `bucket` name and `options` for the GCS client, typically using environment variables.

```TypeScript
import { gcsStorage } from '@payloadcms/storage-gcs'
import { Media } from './collections/Media'
import { MediaWithPrefix } from './collections/MediaWithPrefix'

export default buildConfig({
  collections: [Media, MediaWithPrefix],
  plugins: [
    gcsStorage({
      collections: {
        media: true,
        'media-with-prefix': {
          prefix
        }
      },
      bucket: process.env.GCS_BUCKET,
      options: {
        apiEndpoint: process.env.GCS_ENDPOINT,
        projectId: process.env.GCS_PROJECT_ID
      }
    })
  ]
})
```

--------------------------------

### Configure Next.js Draft Preview URL with Query Parameters

Source: https://payloadcms.com/docs/admin/preview

This example demonstrates how to configure the `admin.preview` function in Payload for Next.js Draft Preview. It constructs a relative URL `/preview` with URL search parameters including `slug`, `collection`, `path`, and a `previewSecret`, which are essential for the front-end application to enter draft mode.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    preview: ({ slug, collection }) => {
      const encodedParams = new URLSearchParams({
        slug,
        collection,
        path: `/${slug}`,
        previewSecret: process.env.PREVIEW_SECRET || '',
      })

      return `/preview?${encodedParams.toString()}`
    },
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
    },
  ],
}
```

--------------------------------

### Configure Payload CMS with Nested Docs Plugin

Source: https://payloadcms.com/docs/plugins/nested-docs

This example shows how to integrate the `nestedDocsPlugin` into your Payload CMS configuration. It demonstrates how to import the plugin, specify the collections it should apply to, and define custom functions for generating breadcrumb labels and URLs based on document data.

```JavaScript
import { buildConfig } from 'payload'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'

const config = buildConfig({
  collections: [
    {
      slug: 'pages',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'slug',
          type: 'text',
        },
      ],
    },
  ],
  plugins: [
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => doc.title,
      generateURL: (docs) =>
        docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),
  ],
})

export default config
```

--------------------------------

### Payload CMS Authentication: User Login

Source: https://payloadcms.com/docs/authentication/operations

Details the process of user login, accepting email and password to return user details and an authentication token. Examples are provided for REST API using fetch, GraphQL mutation, and Local API usage.

```javascript
const res = await fetch('http://localhost:3000/api/[collection-slug]/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'dev@payloadcms.com',
    password: 'this-is-not-our-password...or-is-it?'
  })
})

const json = await res.json()

// JSON will be equal to the following:
/*
{
  user: {
    email: 'dev@payloadcms.com',
    createdAt: "2020-12-27T21:16:45.645Z",
    updatedAt: "2021-01-02T18:37:41.588Z",
    id: "5ae8f9bde69e394e717c8832"
  },
  token: '34o4345324...', 
  exp: 1609619861
}
*/
```

```graphql
mutation {
  login[collection-singular-label](email: "dev@payloadcms.com", password: "yikes") {
    user {
      email
    }
    exp
    token
  }
}
```

```javascript
const result = await payload.login({
  collection: 'collection-slug',
  data: {
    email: 'dev@payloadcms.com',
    password: 'get-out'
  }
})
```

--------------------------------

### Drizzle ORM: Combining Conditions with Raw SQL

Source: https://payloadcms.com/docs/database/postgres

An example demonstrating how to combine multiple conditions using Drizzle ORM's `and` and `eq` functions, incorporating a raw SQL fragment (`sql`) for a case-insensitive comparison on a text field. This is useful for complex query building.

```SQL
and(eq(posts.id, 50), sql`lower(${posts.title}) = 'example post title'`)
```

--------------------------------

### Import useTenantSelection React Hook

Source: https://payloadcms.com/docs/plugins/multi-tenant

Demonstrates the import statement for the `useTenantSelection` hook from the multi-tenant plugin's client-side library, preparing it for use in React components.

```TypeScript
import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'

...

const tenantContext = useTenantSelection()
```

--------------------------------

### Payload CMS Authentication: User Logout

Source: https://payloadcms.com/docs/authentication/operations

Explains the secure logout process for Payload CMS, which involves deleting the HTTP-only token. Examples are provided for REST API using fetch and GraphQL mutation.

```javascript
const res = await fetch('http://localhost:3000/api/[collection-slug]/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

```graphql
mutation {
  logout[collection-singular-label]
}
```

--------------------------------

### Payload CMS Local API: Find Global Versions

Source: https://payloadcms.com/docs/versions/overview

Example of using the Payload CMS Local API `payload.findGlobalVersions` method to query and retrieve a paginated set of versions for a specific global. Demonstrates various parameters like `slug`, `depth`, `page`, `limit`, `where`, `sort`, `locale`, and access control options.

```JavaScript
const result = await payload.findGlobalVersions({
  slug: 'header', // required
  depth: 2,
  page: 1,
  limit: 10,
  where: {}, // pass a `where` query here
  sort: '-createdAt',
  locale: 'en',
  fallbackLocale: false,
  user: dummyUser,
  overrideAccess: false,
  showHiddenFields: true,
})
```

--------------------------------

### Accessing Client-side Environment Variables in React Component

Source: https://payloadcms.com/docs/configuration/environment-vars

Illustrates how a React client component can access environment variables prefixed with `NEXT_PUBLIC_` that are exposed by Next.js for client-side use. This example retrieves a Stripe publishable key.

```typescript
'use client'
import React from 'react'

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

const MyClientComponent = () => {
  // do something with the key

  return <div>My Client Component</div>
}
```

--------------------------------

### Upload Local File using Payload `create` Method in Node.js

Source: https://payloadcms.com/docs/upload/overview

This Node.js example shows how to upload a file stored on the local machine directly using Payload's `payload.create` method. It's particularly useful for server-side operations like seed scripts, leveraging the `filePath` property to specify the file's location.

```javascript
const localFilePath = path.resolve(__dirname, filename)

await payload.create({
  collection: 'media',
  data: {
    alt,
  },
  filePath: localFilePath,
})
```

--------------------------------

### Configure Payload CMS Email with SendGrid Nodemailer Transport

Source: https://payloadcms.com/docs/email/overview

An example demonstrating the use of a third-party Nodemailer transport, specifically nodemailer-sendgrid, within Payload CMS email configuration. It requires a SendGrid API key.

```TypeScript
import { buildConfig } from 'payload'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailerSendgrid from 'nodemailer-sendgrid'

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'info@payloadcms.com',
    defaultFromName: 'Payload',
    transportOptions: nodemailerSendgrid({
      apiKey: process.env.SENDGRID_API_KEY,
    }),
  }),
})
```

--------------------------------

### Payload Query Presets Configuration Options

Source: https://payloadcms.com/docs/query-presets/overview

This API documentation outlines the available configuration options for Query Presets, which are managed via the `queryPresets` property in the root Payload configuration. These options allow for fine-grained control over access, filtering, and labeling of presets.

```APIDOC
queryPresets: object
  access: object | function (optional)
    Description: Used to define custom collection-level access control that applies to all presets.
    Type: Access control function or object (e.g., { read: Access, update: Access })
  filterConstraints: object (optional)
    Description: Used to define which constraints are available to users when managing presets.
    Type: Object
  constraints: object (optional)
    Description: Used to define custom document-level access control that apply to individual presets.
    Type: Object
  labels: object (optional)
    Description: Custom labels to use for the Query Presets collection.
    Type: { singular: string, plural: string }
```

--------------------------------

### Configure Global Upload File Size Limit in Payload CMS

Source: https://payloadcms.com/docs/upload/overview

Example demonstrating how to set a global file size limit for uploads within the Payload CMS configuration using the `upload.limits.fileSize` property. This limit applies across all collections unless overridden.

```javascript
import { buildConfig } from 'payload'

export default buildConfig({
  collections: [
    {
      slug: 'media',
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
      ],
      upload: true,
    },
  ],
  upload: {
    limits: {
      fileSize: 5000000, // 5MB, written in bytes
    },
  },
})
```

--------------------------------

### Create Custom beforeDocumentControls React Client Component

Source: https://payloadcms.com/docs/custom-components/edit-view

An example of a custom component rendered before document controls, implemented as a React Client Component. It uses `'use client'` and receives `BeforeDocumentControlsClientProps`, suitable for interactive client-side UI.

```typescript
'use client'
import React from 'react'
import type { BeforeDocumentControlsClientProps } from 'payload'

export function MyCustomDocumentControlButton(
  props: BeforeDocumentControlsClientProps,
) {
  return <div>This is a custom beforeDocumentControl button (Client)</div>
}
```

--------------------------------

### Payload CMS Reset Password Operations

Source: https://payloadcms.com/docs/authentication/operations

Examples illustrating how to complete a password reset in Payload CMS after a token has been generated. Covers usage with REST and GraphQL APIs, including expected request bodies and the structure of the successful response.

```javascript
const res = await fetch(`http://localhost:3000/api/[collection-slug]/reset-password`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: 'TOKEN_GOES_HERE',
    password: 'not-today',
  }),
});

const json = await res.json();

// JSON will be equal to the following:
/*
{
  user: {
    email: 'dev@payloadcms.com',
    createdAt: "2020-12-27T21:16:45.645Z",
    updatedAt: "2021-01-02T18:37:41.588Z",
    id: "5ae8f9bde69e394e717c8832"
  },
  token: '34o4345324...',
  exp: 1609619861
}
*/
```

```graphql
mutation {
  resetPassword[collection-singular-label](token: "TOKEN_GOES_HERE", password: "not-today")
}
```

--------------------------------

### Configure Admin Options for Payload Text Field

Source: https://payloadcms.com/docs/fields/text

This example shows how to apply admin-specific configurations to a Text Field in Payload CMS. These settings control the field's appearance and behavior exclusively within the Admin Panel.

```TypeScript
import type { Field } from 'payload'

export const MyTextField: Field = {
// ...
admin: {

// ...
}
}
```

--------------------------------

### Configure Payload for Runtime Migrations on Server Startup

Source: https://payloadcms.com/docs/database/migrations

This TypeScript code snippet illustrates how to configure Payload CMS to run database migrations automatically when the server starts up. By passing the `migrations` array to the `prodMigrations` key within your database adapter configuration, Payload will execute any unapplied migrations in production environments, making it suitable for long-running Node.js servers or containers where build-time database access is not feasible.

```TypeScript
// Import your migrations from the `index.ts` file
// that Payload generates for you
import { migrations } from './migrations'
import { buildConfig } from 'payload'

export default buildConfig({
  // your config here
  db: postgresAdapter({
    // your adapter config here
    prodMigrations: migrations,
  }),
})
```

--------------------------------

### Configure Payload CORS with Wildcard Origin

Source: https://payloadcms.com/docs/configuration/overview

Example showing how to configure Cross-Origin Resource Sharing (CORS) in Payload CMS to allow requests from any domain using a wildcard string (`'*'`). This is set directly within the `cors` property of the `buildConfig` function.

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  cors: '*'
})
```

--------------------------------

### Lexical Editor 'features' Prop API Documentation

Source: https://payloadcms.com/docs/rich-text/overview

API documentation for the 'features' prop used when initializing the Lexical Editor, detailing the 'defaultFeatures' and 'rootFeatures' parameters available to the function.

```APIDOC
features: (props: { defaultFeatures: Array<Feature>, rootFeatures: Array<Feature> }) => Array<Feature> | Array<Feature>
  Prop: defaultFeatures
    Description: This opinionated array contains all "recommended" default features.
  Prop: rootFeatures
    Description: This array contains all features that are enabled in the root richText editor (the one defined in the payload.config.ts). If this field is the root richText editor, or if the root richText editor is not a lexical editor, this array will be empty.
```

--------------------------------

### Set Custom Payload Config Path via Environment Variable

Source: https://payloadcms.com/docs/configuration/overview

Demonstrates how to specify a custom location for the Payload configuration file using the `PAYLOAD_CONFIG_PATH` environment variable within a `package.json` script. This method bypasses automatic config detection and can be useful for non-standard setups or switching configurations.

```json
{
  "scripts": {
    "payload": "PAYLOAD_CONFIG_PATH=/path/to/custom-config.ts payload"
  }
}
```

--------------------------------

### Execute Payload Jobs via API Endpoint

Source: https://payloadcms.com/docs/jobs-queue/queues

This code snippet illustrates how to programmatically trigger the execution of Payload jobs by making a GET request to the `/api/payload-jobs/run` endpoint. It demonstrates how to specify a `limit` for the number of jobs to process and select a specific `queue` from which to pull jobs. An authorization header is included for secure access.

```JavaScript
// Here, we're saying we want to run only 100 jobs for this invocation
// and we want to pull jobs from the `nightly` queue:
await fetch('/api/payload-jobs/run?limit=100&queue=nightly', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

--------------------------------

### Configure Document Locking in Payload Collection

Source: https://payloadcms.com/docs/admin/locked-documents

This example demonstrates how to configure document locking for a Payload collection, specifically setting a custom lock duration. It shows the `lockDocuments` property within a `CollectionConfig` object, specifying the `duration` in seconds.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    // other fields...
  ],
  lockDocuments: {
    duration: 600, // Duration in seconds
  },
}
```

--------------------------------

### Configure Custom Error Component in Payload Field

Source: https://payloadcms.com/docs/fields/overview

This example demonstrates how to specify a custom component for the `Error` property within a field's `admin.components` configuration in Payload CMS. This component will be rendered when field validation fails.

```typescript
import type { Field } from 'payload'

export const myField: Field = {
name: 'myField',
type: 'text',
admin: {
components: {
Error: '/path/to/MyCustomErrorComponent'
}
}
}
```

--------------------------------

### Customize Uploaded Filename Using `beforeOperation` Hook

Source: https://payloadcms.com/docs/upload/overview

Example of a Payload CMS `beforeOperation` hook that modifies the filename of an uploaded file before it is saved to the server. This hook demonstrates how to access `req.file` and its properties like `mimeType` and `extension`.

```javascript
beforeOperation: [
  ({ req, operation }) => {
    if ((operation === 'create' || operation === 'update') && req.file) {
      req.file.name = 'test.jpg'
    }
  },
],
```

--------------------------------

### Payload GraphQL Queries for Globals

Source: https://payloadcms.com/docs/graphql/overview

Table listing the automatically generated GraphQL query available for a Payload Global, specifically the `findOne` operation.

```APIDOC
Query Name | Operation
--- | ---
`Header` | `findOne`
```

--------------------------------

### Sort Relationship Options by Collection

Source: https://payloadcms.com/docs/fields/relationship

Example of specifying different sorting fields for each collection's relationship dropdown using an object. Keys are collection slugs and values are field names, with '-' for descending order.

```JavaScript
sortOptions: {
  "pages": "fieldName1",
  "posts": "-fieldName2",
  "categories": "fieldName3"
}
```

--------------------------------

### Next.js Build Commands for Experimental Compile and Generate Modes

Source: https://payloadcms.com/docs/production/building-without-a-db-connection

These shell commands utilize Next.js's experimental build mode to manage the build process without a database connection. The `compile` flag allows compilation without static generation, while the `generate` flag can be used later to create static pages when a database connection is available.

```Shell
pnpx next build --experimental-build-mode compile
```

```Shell
pnpx next build --experimental-build-mode generate
```

--------------------------------

### Basic Sentry Plugin Integration in Payload Config

Source: https://payloadcms.com/docs/plugins/sentry

Demonstrates how to import and include the Sentry plugin in your Payload application's build configuration, passing the required Sentry instance.

```javascript
import { buildConfig } from 'payload'
import { sentryPlugin } from '@payloadcms/plugin-sentry'

import { Pages, Media } from './collections'

import * as Sentry from '@sentry/nextjs'

const config = buildConfig({
  collections: [Pages, Media],
  plugins: [
    sentryPlugin({
      Sentry,
    }),
  ],
})
```

--------------------------------

### Create Custom List View Client Component in React

Source: https://payloadcms.com/docs/custom-components/list-view

An example of a React client component for a custom List View in Payload CMS. It uses `'use client'` directive, imports `ListViewClientProps`, and renders a simple div.

```TypeScript
'use client'
import React from 'react'
import type { ListViewClientProps } from 'payload'

export function MyCustomClientListView(props: ListViewClientProps) {
  return <div>This is a custom List View (Client)</div>
}
```

--------------------------------

### Configure Locales with Detailed Objects and RTL Support

Source: https://payloadcms.com/docs/configuration/localization

This snippet illustrates a more advanced way to define locales using full configuration objects, providing greater control. It allows specifying a `label`, `code`, and additional properties like `rtl` for right-to-left language support in the admin UI. The example also includes the `fallback` option, which defaults to true.

```javascript
import { buildConfig } from 'payload'

export default buildConfig({
  collections: [
    // collections go here
  ],
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Arabic',
        code: 'ar',
        // opt-in to setting default text-alignment on Input fields to rtl (right-to-left)
        // when current locale is rtl
        rtl: true,
      },
    ],
    defaultLocale: 'en', // required
    fallback: true, // defaults to true
  },
})
```

--------------------------------

### Dynamically Populate Lexical Nodes with Payload API on Server-side

Source: https://payloadcms.com/docs/rich-text/converting-html

For improved performance on the server, this example demonstrates using `convertLexicalToHTMLAsync` with `getPayloadPopulateFn`. This function leverages the Payload API directly to populate dynamic nodes within Lexical content, making it suitable for server-side rendering components (RSCs).

```typescript
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import { getPayload } from 'payload'
import React from 'react'

import config from '../../config.js'

export const MyRSCComponent = async ({
  data,
}: {
  data: SerializedEditorState
}) => {
  const payload = await getPayload({
    config,
  })

  const html = await convertLexicalToHTMLAsync({
    data,
    populate: await getPayloadPopulateFn({
      currentDepth: 0,
      depth: 1,
      payload,
    }),
  })

  return html && <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

--------------------------------

### Payload CMS Custom Document Tab Server Component Example

Source: https://payloadcms.com/docs/custom-components/document-views

This code snippet demonstrates how to create a custom server-side React component for a Payload CMS document tab. It imports necessary types and components from 'payload' and '@payloadcms/ui' and renders a simple link.

```TypeScript
import React from 'react'
import type { DocumentTabServerProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function MyCustomTabComponent(props: DocumentTabServerProps) {
  return (
    <Link href="/my-custom-tab">This is a custom Document Tab (Server)</Link>
  )
}
```

--------------------------------

### Receive Custom Props in PayloadCMS React Client Component

Source: https://payloadcms.com/docs/custom-components/overview

Demonstrates how a React client component in PayloadCMS can receive and utilize custom properties passed via the `clientProps` configuration. The example shows a simple component rendering a custom string prop received from the PayloadCMS configuration.

```javascript
import React from 'react'
import { Link } from '@payloadcms/ui'

export function MyComponent({ myCustomProp }: { myCustomProp: string }) {
  return <Link href="/admin/logout">{myCustomProp}</Link>
}
```

--------------------------------

### Define a Basic Payload CMS Plugin Structure

Source: https://payloadcms.com/docs/plugins/build-your-own

This snippet illustrates the fundamental structure of a Payload CMS plugin. It's a higher-order function that takes plugin options and an incoming Payload configuration. The plugin creates a copy of the configuration, allowing modifications to properties like collections, globals, and the `onInit` function before returning the modified configuration.

```TypeScript
import type { Config } from 'payload'

export const samplePlugin =
  (pluginOptions: PluginTypes) =>
  (incomingConfig: Config): Config => {
    // create copy of incoming config
    let config = { ...incomingConfig }

    /**
     * This is where you could modify the
     * config based on the plugin options
     */

    // If you wanted to add a new collection:
    config.collections = [
      ...(config.collections || []),
      newCollection,
    ]

    // If you wanted to add a new global:
    config.globals = [
      ...(config.globals || []),
      newGlobal,
    ]

    /**
     * If you wanted to add a new field to a collection:
     *
     * 1. Loop over collections
     * 2. Find the collection you want to add the field to
     * 3. Add the field to the collection
     */

    // If you wanted to add to the onInit:
    config.onInit = async payload => {
      if (incomingConfig.onInit) await incomingConfig.onInit(payload)
      // Add additional onInit code here
    }

    // Finally, return the modified config
    return config
  }
```

--------------------------------

### Configure Locales with String Codes in Payload

Source: https://payloadcms.com/docs/configuration/localization

This example shows how to define a list of supported locales using simple string codes within the `localization.locales` array. It also specifies the `defaultLocale`, which is a mandatory setting for localization to function correctly, ensuring a fallback language if none is specified.

```javascript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  localization: {
    locales: ['en', 'es', 'de'], // required
    defaultLocale: 'en', // required
  },
})
```

--------------------------------

### Payload Configuration Options Reference

Source: https://payloadcms.com/docs/configuration/overview

This section provides a detailed reference for the various options available within the Payload configuration object. Each option controls a specific aspect of the Payload CMS, ranging from admin panel settings and database integration to security features and content management. Understanding these options is crucial for customizing and extending Payload's functionality.

```APIDOC
PayloadConfigOptions:
  admin: The configuration options for the Admin Panel, including Custom Components, Live Preview, etc.
  bin: Register custom bin scripts for Payload to execute.
  editor: The Rich Text Editor which will be used by `richText` fields.
  db: The Database Adapter which will be used by Payload.
  serverURL: A string used to define the absolute URL of your app. This includes the protocol, for example `https://example.com`. No paths allowed, only protocol, domain and (optionally) port.
  collections: An array of Collections for Payload to manage.
  compatibility: Compatibility flags for earlier versions of Payload.
  globals: An array of Globals for Payload to manage.
  cors: Cross-origin resource sharing (CORS) is a mechanism that accept incoming requests from given domains. You can also customize the `Access-Control-Allow-Headers` header.
  localization: Opt-in to translate your content into multiple locales.
  logger: Logger options, logger options with a destination stream, or an instantiated logger instance.
  loggingLevels: An object to override the level to use in the logger for Payload's errors.
  graphQL: Manage GraphQL-specific functionality, including custom queries and mutations, query complexity limits, etc.
  cookiePrefix: A string that will be prefixed to all cookies that Payload sets.
  csrf: A whitelist array of URLs to allow Payload to accept cookies from.
  defaultDepth: If a user does not specify `depth` while requesting a resource, this depth will be used.
  defaultMaxTextLength: The maximum allowed string length to be permitted application-wide. Helps to prevent malicious public document creation.
  folders: An optional object to configure global folder settings.
  queryPresets: An object that to configure Collection Query Presets.
  maxDepth: The maximum allowed depth to be permitted application-wide. This setting helps prevent against malicious queries. Defaults to `10`.
```

--------------------------------

### Execute SQL Directly in Postgres Payload Migration

Source: https://payloadcms.com/docs/database/migrations

This example illustrates how to execute raw SQL queries directly against a Postgres database within a Payload migration's `up` function. It uses the `db.execute` method with a SQL template literal, allowing fine-grained control over database operations.

```TypeScript
import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const { rows: posts } = await db.execute(sql`SELECT * from posts`)
}
```

--------------------------------

### Payload CMS Multi-Tenant Plugin Configuration Options (TypeScript)

Source: https://payloadcms.com/docs/plugins/multi-tenant

Defines the configuration interface for the Payload CMS Multi-Tenant Plugin. This TypeScript interface outlines all available options to customize the plugin's behavior, such as cleanup after tenant deletion, collection-specific settings, debug mode, and field configurations for tenant and user relationships.

```APIDOC
type MultiTenantPluginConfig<ConfigTypes = unknown> = {
  /**
   * After a tenant is deleted, the plugin will attempt to clean up related documents
   * - removing documents with the tenant ID
   * - removing the tenant from users
   *
   * @default true
   */
  cleanupAfterTenantDelete?: boolean
  /**
   * Automatically
   */
  collections: {
    [key in CollectionSlug]?: {
      /**
       * Set to `true` if you want the collection to behave as a global
       *
       * @default false
       */
      isGlobal?: boolean
      /**
       * Set to `false` if you want to manually apply the baseListFilter
       *
       * @default true
       */
      useBaseListFilter?: boolean
      /**
       * Set to `false` if you want to handle collection access manually without the multi-tenant constraints applied
       *
       * @default true
       */
      useTenantAccess?: boolean
    }
  }
  /**
   * Enables debug mode
   * - Makes the tenant field visible in the admin UI within applicable collections
   *
   * @default false
   */
  debug?: boolean
  /**
   * Enables the multi-tenant plugin
   *
   * @default true
   */
  enabled?: boolean
  /**
   * Field configuration for the field added to all tenant enabled collections
   */
  tenantField?: {
    access?: RelationshipField['access']
    /**
     * The name of the field added to all tenant enabled collections
     *
     * @default 'tenant'
     */
    name?: string
  }
  /**
   * Field configuration for the field added to the users collection
   *
   * If `includeDefaultField` is `false`, you must include the field on your users collection manually
   * This is useful if you want to customize the field or place the field in a specific location
   */
  tenantsArrayField?:
    | {
        /**
         * Access configuration for the array field
         */
        arrayFieldAccess?: ArrayField['access']
        /**
         * Name of the array field
         *
         * @default 'tenants'
         */
        arrayFieldName?: string
        /**
         * Name of the tenant field
         *
         * @default 'tenant'
         */
        arrayTenantFieldName?: string
        /**
         * When `includeDefaultField` is `true`, the field will be added to the users collection automatically
         */
        includeDefaultField?: true
        /**
         * Additional fields to include on the tenants array field
         */
        rowFields?: Field[]
        /**
         * Access configuration for the tenant field
         */
        tenantFieldAccess?: RelationshipField['access']
      }
    | {
        arrayFieldAccess?: never
        arrayFieldName?: string
        arrayTenantFieldName?: string
        /**
         * When `includeDefaultField` is `false`, you must include the field on your users collection manually
         */
        includeDefaultField?: false
        rowFields?: never
        tenantFieldAccess?: never
      }
  /**
   * Customize tenant selector label
   *
   */
}
```

--------------------------------

### Queue a new Job for a single Task in Payload CMS

Source: https://payloadcms.com/docs/jobs-queue/jobs

This example shows how to queue a job for a single, specific task. Similar to workflow jobs, it uses `payload.jobs.queue` but specifies the task's slug and its input data. This is useful for running isolated operations.

```TypeScript
const createdJob = await payload.jobs.queue({
  task: 'createPost',
  input: {
    title: 'my title',
  },
})
```

--------------------------------

### Payload CMS Relationship Field Data Save Format (Has Many)

Source: https://payloadcms.com/docs/fields/relationship

Example of the JSON data structure required to save an array of related document ObjectIDs to a 'has many' relationship field in Payload CMS.

```JSON
{
  "owners": [
    "6031ac9e1289176380734024",
    "602c3c327b811235943ee12b"
  ]
}
```

--------------------------------

### Configure Azure Blob Storage Adapter in Payload CMS

Source: https://payloadcms.com/docs/upload/storage-adapters

This example illustrates how to integrate and configure the Azure Blob Storage adapter within a Payload CMS `buildConfig`. It specifies which collections should use Azure storage and sets essential connection parameters like `connectionString`, `containerName`, and `baseURL` using environment variables.

```TypeScript
import { azureStorage } from '@payloadcms/storage-azure'
import { Media } from './collections/Media'
import { MediaWithPrefix } from './collections/MediaWithPrefix'

export default buildConfig({
  collections: [Media, MediaWithPrefix],
  plugins: [
    azureStorage({
      collections: {
        media: true,
        'media-with-prefix': {
          prefix
        }
      },
      allowContainerCreate:
        process.env.AZURE_STORAGE_ALLOW_CONTAINER_CREATE === 'true',
      baseURL: process.env.AZURE_STORAGE_ACCOUNT_BASEURL,
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME
    })
  ]
})
```

--------------------------------

### Azure Blob Storage Adapter Configuration Options

Source: https://payloadcms.com/docs/upload/storage-adapters

Reference documentation for the configuration options available when setting up the Azure Blob Storage adapter in Payload CMS. It details each option's purpose and default value.

```APIDOC
Option: enabled
  Description: Whether or not to enable the plugin
  Default: true

Option: collections
  Description: Collections to apply the Azure Blob adapter to
  Default: 

Option: allowContainerCreate
  Description: Whether or not to allow the container to be created if it does not exist
  Default: false

Option: baseURL
  Description: Base URL for the Azure Blob storage account
  Default: 

Option: connectionString
  Description: Azure Blob storage connection string
  Default: 

Option: containerName
  Description: Azure Blob storage container name
  Default: 

Option: clientUploads
  Description: Do uploads directly on the client to bypass limits on Vercel.
  Default: 
```

--------------------------------

### Create a Payload CMS Seeding Script

Source: https://payloadcms.com/docs/configuration/overview

This TypeScript script demonstrates how to create a custom seeding function for Payload CMS. It initializes Payload with the provided configuration, creates a new 'pages' collection entry with a title, logs a success message, and then exits the process. This script is designed to be run as a custom bin script.

```typescript
import type { SanitizedConfig } from 'payload'

import payload from 'payload'

// Script must define a "script" function export that accepts the sanitized config
export const script = async (config: SanitizedConfig) => {
await payload.init({ config })
await payload.create({
collection: 'pages',
data: { title: 'my title' }
})
payload.logger.info('Successfully seeded!')
process.exit(0)
}
```

--------------------------------

### Configure Components Before Payload Dashboard

Source: https://payloadcms.com/docs/custom-components/root-components

This snippet illustrates how to inject custom components into the `beforeDashboard` property of `admin.components`. These components will be rendered before the default dashboard contents, allowing for custom elements or information to appear at the top of the dashboard view.

```JavaScript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    components: {
      beforeDashboard: ['/path/to/your/component'],
    },
  },
})
```

--------------------------------

### Configure Global Folders in Payload CMS

Source: https://payloadcms.com/docs/folders/overview

This JavaScript example demonstrates how to configure global folder settings within a Payload CMS `buildConfig` call. It shows how to enable debug mode, provide collection overrides, and specify custom field and slug names for the folder feature.

```JavaScript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  folders: {
    debug: true, // optional
    collectionOverrides: [
      async ({ collection }) => {
        return collection
      },
    ], // optional
    fieldName: 'folder', // optional
    slug: 'payload-folders', // optional
  },
})
```

--------------------------------

### Example Custom Collection Interface in TypeScript

Source: https://payloadcms.com/docs/typescript/generating-types

Defines a TypeScript interface for a PayloadCMS collection, demonstrating how to include optional fields like `meta`. This snippet illustrates the structure for extending Payload's generated types with custom fields.

```TypeScript
export interface Collection1 {
// ...other fields
meta?: SharedMeta
}
```

--------------------------------

### Payload SQLite Adapter Configuration Options Reference

Source: https://payloadcms.com/docs/database/sqlite

This section provides a detailed reference for all available configuration options when using the `sqliteAdapter` in Payload CMS. It covers client connection settings, development mode behaviors, migration directory customization, logging, ID type definitions, transaction settings, and schema initialization hooks, allowing fine-grained control over the SQLite integration.

```APIDOC
sqliteAdapter Options:
  client: Client connection options passed to `createClient` from `@libsql/client`. (Required)
  push: Disable Drizzle's `db push` in development mode. (Default: enabled for development)
  migrationDir: Customize the directory where migrations are stored.
  logger: The instance of the logger to be passed to Drizzle. (Default: Payload's logger)
  idType: A string of 'number' or 'uuid' for the data type given to id columns.
  transactionOptions: A SQLiteTransactionConfig object for transactions, or `false` to disable.
  localesSuffix: A string appended to the end of table names for storing localized fields. (Default: '_locales')
  relationshipsSuffix: A string appended to the end of table names for storing relationships. (Default: '_rels')
  versionsSuffix: A string appended to the end of table names for storing versions. (Default: '_v')
  beforeSchemaInit: Drizzle schema hook. Runs before the schema is built.
  afterSchemaInit: Drizzle schema hook. Runs after the schema is built.
  generateSchemaOutputFile: Override generated schema from `payload generate:db-schema` file path. (Default: '{CWD}/src/payload-generated.schema.ts')
  autoIncrement: Pass `true` to enable SQLite AUTOINCREMENT for primary keys to ensure the same ID cannot be reused from deleted rows.
  allowIDOnCreate: Set to `true` to use the `id` passed in data on the create API operations without using a custom ID field.
```

--------------------------------

### Configure job processing order in Payload CMS build config

Source: https://payloadcms.com/docs/jobs-queue/queues

Illustrates how to define the processing order for jobs globally or per queue within the `jobs` configuration of `buildConfig`, mimicking Payload's `sort` property. Examples include static string, object per queue, and dynamic function-based ordering.

```typescript
export default buildConfig({
  // Other configurations...
  jobs: {
    tasks: [
      // your tasks here
    ],
    processingOrder: '-createdAt', // Process jobs in reverse order of creation = LIFO
  },
})
```

```typescript
export default buildConfig({
  // Other configurations...
  jobs: {
    tasks: [
      // your tasks here
    ],
    processingOrder: {
      default: 'createdAt', // FIFO
      queues: {
        nightly: '-createdAt', // LIFO
        myQueue: '-createdAt', // LIFO
      },
    },
  },
})
```

```typescript
export default buildConfig({
  // Other configurations...
  jobs: {
    tasks: [
      // your tasks here
    ],
    processingOrder: ({ queue }) => {
      if (queue === 'myQueue') {
        return '-createdAt' // LIFO
      }
      return 'createdAt' // FIFO
    },
  },
})
```

--------------------------------

### Configure Live Preview with Static URL in Payload CMS

Source: https://payloadcms.com/docs/live-preview/overview

This snippet demonstrates how to enable and configure the Live Preview feature globally within the Payload CMS `buildConfig`. It sets a static URL for the front-end application and specifies which collections should have Live Preview enabled. This configuration allows the Admin Panel to embed and communicate with the specified front-end.

```javascript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    // ...
    livePreview: {
      url: 'http://localhost:3000',
      collections: ['pages'],
    },
  },
})
```

--------------------------------

### Payload CMS: Adding Custom Drizzle Tables via `beforeSchemaInit` Hook

Source: https://payloadcms.com/docs/database/postgres

Demonstrates how to use the `beforeSchemaInit` hook within the `postgresAdapter` configuration to extend Payload CMS's Drizzle schema with custom, non-Payload managed tables. This example adds a simple `added_table` with an `id` column, allowing integration of external database structures.

```TypeScript
import { postgresAdapter } from '@payloadcms/db-postgres';
import {
  integer,
  pgTable,
  serial
} from '@payloadcms/db-postgres/drizzle/pg-core';

postgresAdapter({
  beforeSchemaInit: [
    ({ schema, adapter }) => {
      return {
        ...schema,
        tables: {
          ...schema.tables,
          addedTable: pgTable('added_table', {
            id: serial('id').notNull()
          })
        }
      };
    }
  ]
});
```

--------------------------------

### Payload CMS Local API: Update Global Document

Source: https://payloadcms.com/docs/local-api/overview

This example illustrates how to update an existing global document using the `payload.updateGlobal` method. It includes providing new `data` for the global, handling document locks with `overrideLock`, and specifying other parameters like `depth` and `locale`.

```JavaScript
const result = await payload.updateGlobal({
  slug: 'header', // required
  data: {
    nav: [
      {
        url: 'https://google.com',
      },
      {
        url: 'https://payloadcms.com',
      },
    ],
  },
  depth: 2,
  locale: 'en',
  fallbackLocale: false,
  user: dummyUser,
  overrideAccess: false,
  overrideLock: false, // By default, document locks are ignored. Set to false to enforce locks.
  showHiddenFields: true,
})
```

--------------------------------

### Sort Relationship Options by Single Field

Source: https://payloadcms.com/docs/fields/relationship

Example of defining a global default sort field for all relationship field dropdowns across different collections using a string. A minus symbol ('-') prefixes for descending order.

```JavaScript
sortOptions: 'fieldName',
```

--------------------------------

### Configure Payload CORS with Specific Origins and Custom Headers

Source: https://payloadcms.com/docs/configuration/overview

Example demonstrating how to configure CORS in Payload CMS to allow requests from a specific origin (`http://localhost:3000`) and append a custom header (`x-custom-header`) to `Access-Control-Allow-Headers` using an object configuration.

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  cors: {
    origins: ['http://localhost:3000'],
    headers: ['x-custom-header']
  }
})
```

--------------------------------

### Integrating Custom React Context Providers in Payload Admin

Source: https://payloadcms.com/docs/custom-components/custom-providers

This snippet demonstrates the two main steps for adding a custom React Context provider to the Payload CMS Admin Panel. The first part shows how to update the Payload configuration to reference the custom provider file. The second part provides the boilerplate for the React Context provider component, including the context creation, the provider component, and a custom hook for easy consumption of the context value within client components. This setup enables sharing state and functions across custom components within the admin UI.

```TypeScript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    components: {
      providers: ['/path/to/MyProvider'],
    },
  },
})
```

```TypeScript
'use client'

import React, { createContext, use } from 'react'

const MyCustomContext = React.createContext(myCustomValue)

export function MyProvider({ children }: { children: React.ReactNode }) {
  return <MyCustomContext value={myCustomValue}>{children}</MyCustomContext>
}

export const useMyCustomContext = () => use(MyCustomContext)
```

--------------------------------

### Define Collection with Email Field in Payload CMS

Source: https://payloadcms.com/docs/fields/email

This example demonstrates how to integrate an Email Field into a Payload CMS collection configuration. It defines an `ExampleCollection` with a `contact` field of type `email`, setting its label and marking it as required.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'contact', // required
      type: 'email', // required
      label: 'Contact Email Address',
      required: true
    }
  ]
}
```

--------------------------------

### Disable TypeScript 'declare' Statement in Payload Config

Source: https://payloadcms.com/docs/typescript/generating-types

Configure your `payload.config.ts` to disable the automatic `declare` statement added by `generate:types`. This is useful when `payload-types.ts` is used in other repositories that do not have Payload installed, preventing TypeScript errors.

```typescript
{
// ...
typescript: {
declare: false, // defaults to true if not set
},
}
```

--------------------------------

### Example of a Malicious Fetch Request (CSRF)

Source: https://payloadcms.com/docs/authentication/cookies

Illustrates a potential Cross-Site Request Forgery (CSRF) attack where a malicious website attempts to make an authenticated request on behalf of a logged-in user to a Payload API, leveraging automatically included HTTP-only cookies.

```javascript
// malicious-intent.com
// makes an authenticated request as on your behalf

const maliciousRequest = await fetch(`https://payload-finances.com/api/me`, {
  credentials: 'include',
}).then((res) => await res.json())
```

--------------------------------

### Payload CMS Query for Polymorphic Relationship by Related Collection Slug

Source: https://payloadcms.com/docs/fields/relationship

Generic example of querying a polymorphic relationship field in Payload CMS via the REST API by matching the `relationTo` (related collection slug) property.

```APIDOC
`?where[field.relationTo][equals]=your-collection-slug`
```

--------------------------------

### Payload CMS GraphQL Custom Query Configuration

Source: https://payloadcms.com/docs/graphql/extending

Example configuration for `payload.config.js` demonstrating how to add a custom GraphQL query (`MyCustomQuery`) to Payload CMS. It defines the query's type, fields, arguments, and references an external resolver function. The configuration functions receive Payload's `GraphQL` dependency and the `payload` instance.

```JavaScript
import { buildConfig } from 'payload'
import myCustomQueryResolver from './graphQL/resolvers/myCustomQueryResolver'

export default buildConfig({
  graphQL: {
    queries: (GraphQL, payload) => {
      return {
        MyCustomQuery: {
          type: new GraphQL.GraphQLObjectType({
            name: 'MyCustomQuery',
            fields: {
              text: {
                type: GraphQL.GraphQLString,
              },
              someNumberField: {
                type: GraphQL.GraphQLFloat,
              },
            },
          }),
          args: {
            argNameHere: {
              type: new GraphQL.GraphQLNonNull(GraphQLString),
            },
          },
          resolve: myCustomQueryResolver,
        },
      }
    },
  },
})
```

--------------------------------

### Convert Lexical JSON to HTML On-Demand in a React Component

Source: https://payloadcms.com/docs/rich-text/converting-html

This example demonstrates how to convert `SerializedEditorState` (Lexical JSON) to HTML on the client-side using the `convertLexicalToHTML` function from `@payloadcms/richtext-lexical/html`. The resulting HTML is then rendered directly into a React component using `dangerouslySetInnerHTML`.

```typescript
'use client'

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import React from 'react'

export const MyComponent = ({ data }: { data: SerializedEditorState }) => {
  const html = convertLexicalToHTML({ data })

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

--------------------------------

### Example: Global Update Access Control Function

Source: https://payloadcms.com/docs/access-control/globals

Demonstrates an `update` access control function for a Payload Global. This function determines if a user can modify the global document, often by checking user authentication and potentially inspecting the incoming `data`.

```TypeScript
import { GlobalConfig } from 'payload'

const Header: GlobalConfig = {
// ...
access: {
update: ({ req: { user }, data }) => {
return Boolean(user)
},
},
}
```

--------------------------------

### Example Custom Client-Side Edit View Component (React)

Source: https://payloadcms.com/docs/custom-components/edit-view

A basic React component illustrating a custom client-side Edit View for Payload CMS. It uses the `'use client'` directive, receives `DocumentViewClientProps`, and renders a simple div.

```TypeScript
'use client'
import React from 'react'
import type { DocumentViewClientProps } from 'payload'

export function MyCustomClientEditView(props: DocumentViewClientProps) {
  return <div>This is a custom Edit View (Client)</div>
}
```

--------------------------------

### Payload Admin Panel Next.js Project Structure

Source: https://payloadcms.com/docs/admin/overview

This snippet illustrates the typical directory structure created by Payload within a Next.js application, showing the organization of Admin Panel routes, API routes (REST, GraphQL), and custom styling files.

```Filesystem
app/
├─ (payload)/
├── admin/
├─── [[...segments]]/
├──── page.tsx
├──── not-found.tsx
├── api/
├─── [...slug]/
├──── route.ts
├── graphql/
├──── route.ts
├── graphql-playground/
├──── route.ts
├── custom.scss
├── layout.tsx
```

--------------------------------

### Loading Environment Variables with dotenv (Non-Next.js)

Source: https://payloadcms.com/docs/configuration/environment-vars

Provides an example of using the `dotenv` package to load environment variables from a `.env` file into `process.env` when Payload is used outside of a Next.js application. The `dotenv.config()` call should be placed as high as possible in your application's entry point.

```typescript
import dotenv from 'dotenv'
dotenv.config()

import { buildConfig } from 'payload'

export default buildConfig({
  serverURL: process.env.SERVER_URL,
  // ...
})
```

--------------------------------

### Example: Global Read Versions Access Control Function

Source: https://payloadcms.com/docs/access-control/globals

Illustrates the `readVersions` access control function for a version-enabled Payload Global. This function controls whether a user can access the historical versions of the global document, typically based on their authentication status.

```TypeScript
import type { GlobalConfig } from 'payload'

export const GlobalWithVersionsAccess: GlobalConfig = {
// ...
access: {
readVersions: ({ req: { user } }) => {
return Boolean(user)
},
},
}
```

--------------------------------

### Generate Fully Qualified Preview URL using Request Object

Source: https://payloadcms.com/docs/admin/preview

This snippet shows how to construct a fully qualified preview URL using the `req` object provided to the `admin.preview` function. It leverages `req.protocol` and `req.host` to create an absolute URL, which is useful for deployments requiring full URLs like Vercel Preview Deployments.

```TypeScript
preview: (doc, { req }) => `${req.protocol}//${req.host}/${doc.slug}`
```

--------------------------------

### Configure `pasteURL` for Remote URL Fetching in TypeScript

Source: https://payloadcms.com/docs/upload/overview

This TypeScript configuration example demonstrates how to set up the `pasteURL` option within a Payload CMS `CollectionConfig`. It illustrates the use of an `allowList` to restrict server-side fetching of remote URLs to specific trusted domains, enhancing security and bypassing CORS issues.

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    pasteURL: {
      allowList: [
        {
          hostname: 'payloadcms.com', // required
          pathname: '',
          port: '',
          protocol: 'https',
          search: ''
        },
        {
          hostname: 'example.com',
          pathname: '/images/*',
        },
      ],
    },
  },
}
```

--------------------------------

### Configure Payload CMS Task to Always Re-run

Source: https://payloadcms.com/docs/jobs-queue/tasks

This example illustrates how to override the default task restoration behavior in Payload CMS. By setting `retries.shouldRestore` to `false`, the task will be re-run every time, even if it previously succeeded, ignoring any prior successful execution.

```TypeScript
export default buildConfig({
  // ...
  jobs: {
    tasks: [
      {
        slug: 'myTask',
        retries: {
          shouldRestore: false,
        },
        // ...
      } as TaskConfig<'myTask'>,
    ],
  },
})
```

--------------------------------

### Payload Local API: Select Fields (Include Mode)

Source: https://payloadcms.com/docs/queries/select

Demonstrates how to use the `select` option within Payload's Local API `payload.find` method to explicitly include specific fields from a collection. This example selects 'text', a nested 'group.number', and an entire 'array' field.

```TypeScript
import type { Payload } from 'payload'

const getPosts = async (payload: Payload) => {
  const posts = await payload.find({
    collection: 'posts',
    select: {
      text: true,
      // select a specific field from group
      group: {
        number: true,
      },
      // select all fields from array
      array: true,
    },
  })

  return posts
}
```

--------------------------------

### Payload CMS Collection Version Document Structure

Source: https://payloadcms.com/docs/versions/overview

Example JSON structure of a version document stored in the `_slug_versions` collection for a Payload CMS collection. It includes metadata like `_id`, `parent`, `autosave`, and the actual document `version` data, along with `createdAt` and `updatedAt` timestamps.

```JSON
{
  "_id": "61cf752c19cdf1b1af7b61f1", // a unique ID of this version
  "parent": "61ce1354091d5b3ffc20ea6e", // the ID of the parent document
  "autosave": false, // used to denote if this version was created via autosave
  "version": {
    // your document's data goes here
    // all fields are set to not required and this property can be partially complete
  },
  "createdAt": "2021-12-31T21:25:00.992+00:00",
  "updatedAt": "2021-12-31T21:25:00.992+00:00"
}
```

--------------------------------

### Payload CMS Query for Polymorphic Relationship by Related Document ID

Source: https://payloadcms.com/docs/fields/relationship

Generic example of querying a polymorphic relationship field in Payload CMS via the REST API by matching the `value` (related document ID) property.

```APIDOC
`?where[field.value][equals]=6031ac9e1289176380734024`
```

--------------------------------

### Implement Markdown Transformers in a Server Feature

Source: https://payloadcms.com/docs/rich-text/custom-features

This example shows how to define and integrate a custom `ElementTransformer` for markdown conversion within a server feature. It demonstrates how to export a custom node to markdown and convert markdown back into a custom node, linking to a custom node type.

```TypeScript
import { createServerFeature } from '@payloadcms/richtext-lexical'
import type { ElementTransformer } from '@payloadcms/richtext-lexical/lexical/markdown'
import { $createMyNode, $isMyNode, MyNode } from './nodes/MyNode'

const MyMarkdownTransformer: ElementTransformer = {
type: 'element',
dependencies: [MyNode],
export: (node, exportChildren) => {
if (!$isMyNode(node)) {
return null
}
return '+++'
},
// match ---
regExp: /^+++\s\*$/,
replace: (parentNode) => {
const node = $createMyNode()
if (node) {
parentNode.replace(node)
}
},
}

export const MyFeature = createServerFeature({
feature: {
markdownTransformers: [MyMarkdownTransformer],
},
key: 'myFeature',
})
```

--------------------------------

### Payload CMS Local API: Restore Collection Version

Source: https://payloadcms.com/docs/versions/overview

Example of using the Payload CMS Local API `payload.restoreVersion` method to restore a specific version of a collection document by its ID. Illustrates required parameters `collection` and `id`, and options for depth and access control.

```JavaScript
const result = await payload.restoreVersion({
  collection: 'posts', // required
  id: '507f1f77bcf86cd799439013', // required
  depth: 2,
  user: dummyUser,
  overrideAccess: false,
  showHiddenFields: true,
})
```

--------------------------------

### Configure Metadata for a Payload Collection

Source: https://payloadcms.com/docs/admin/metadata

This example illustrates how to customize metadata for a specific collection in Payload CMS. It uses the 'admin.meta' property within a 'CollectionConfig' to set the title and description for all views within that collection.

```TypeScript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
// ...
admin: {
meta: {
title: 'My Collection',
description: 'The best collection in the world',
},
},
}
```

--------------------------------

### PayloadCMS Field Component Props Reference

Source: https://payloadcms.com/docs/fields/overview

Detailed documentation for properties available to PayloadCMS Server Components and additional props for specific field contexts like schema and index paths.

```APIDOC
Field Component Props:
  schemaPath: string - A string representing the direct, static path to the Field Config, i.e. `posts.myGroup.myArray.myField`.
  indexPath: string - A hyphen-notated string representing the path to the field *within the nearest named ancestor field*, i.e. `0-0`.

Default Field Component Props (for Server Components):
  clientField: object - The serializable Client Field Config.
  field: object - The Field Config.
  data: object - The current document being edited.
  i18n: object - The i18n object.
  payload: object - The Payload class.
  permissions: object - The field permissions based on the currently authenticated user.
  siblingData: object - The data of the field's siblings.
  user: object - The currently authenticated user.
  value: any - The value of the field at render-time.
```

--------------------------------

### Payload CMS Local API: Find Global Version by ID

Source: https://payloadcms.com/docs/versions/overview

Example of using the Payload CMS Local API `payload.findGlobalVersionByID` method to retrieve a specific version of a global document by its ID. The provided snippet is incomplete but shows the required `slug` parameter.

```JavaScript
const result = await payload.findGlobalVersionByID({
  slug: 'header', // required
})
```

--------------------------------

### Payload CMS Relationship Field Data Save Format (Has One)

Source: https://payloadcms.com/docs/fields/relationship

Example of the JSON data structure required to save a single related document's ObjectID to a 'has one' relationship field in Payload CMS.

```JSON
{
  "owner": "6031ac9e1289176380734024"
}
```

--------------------------------

### Configure Payload CMS Email with Custom Nodemailer Transport Instance

Source: https://payloadcms.com/docs/email/overview

This snippet shows how to integrate a pre-configured Nodemailer transport instance directly into Payload's email configuration. This provides full control over the Nodemailer transporter setup.

```TypeScript
import { buildConfig } from 'payload'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'info@payloadcms.com',
    defaultFromName: 'Payload',
    // Any Nodemailer transport can be used
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
})
```

--------------------------------

### PayloadCMS Local API: Find Documents

Source: https://payloadcms.com/docs/local-api/overview

Demonstrates how to query and retrieve multiple documents from a PayloadCMS collection using the Local API's `find` method. It showcases options for pagination, depth, filtering with `where` clauses, sorting, locale settings, and access control overrides.

```JavaScript
// Result will be a paginated set of Posts.
// See /docs/queries/pagination for more.
const result = await payload.find({
  collection: 'posts', // required
  depth: 2,
  page: 1,
  limit: 10,
  pagination: false, // If you want to disable pagination count, etc.
  where: {}, // pass a `where` query here
  sort: '-title',
  locale: 'en',
  fallbackLocale: false,
  user: dummyUser,
  overrideAccess: false,
  showHiddenFields: true
})
```

--------------------------------

### Payload CMS Custom Document Tab Client Component Example

Source: https://payloadcms.com/docs/custom-components/document-views

This code snippet illustrates how to create a custom client-side React component for a Payload CMS document tab. It includes the 'use client' directive, imports required types and components, and renders a basic link for the tab.

```TypeScript
'use client'
import React from 'react'
import type { DocumentTabClientProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function MyCustomTabComponent(props: DocumentTabClientProps) {
  return (
    <Link href="/my-custom-tab">This is a custom Document Tab (Client)</Link>
  )
}
```

--------------------------------

### Payload CMS URL Matching Configuration Parameters

Source: https://payloadcms.com/docs/upload/overview

These parameters define how URLs are matched or configured within Payload CMS, specifically for features that involve URL-based conditions. They cover aspects like port numbers, protocols, and exact query string matching.

```APIDOC
port:
  description: The port number of the URL. If not specified, the default port for the protocol will be used.
  default: 3000
protocol:
  description: The protocol to match. Must be either `http` or `https`.
  default: https
search:
  description: The query string of the URL. If specified, the URL must match this exact query string.
  example: ?version=1
```

--------------------------------

### Whitelist Admin Panel Domain in CSP for Iframe

Source: https://payloadcms.com/docs/live-preview/client

This example demonstrates how to configure the `frame-ancestors` directive within a Content Security Policy (CSP). By whitelisting the Payload Admin Panel's domain, it resolves issues where the Admin Panel's iframe might refuse to connect or load the front-end application due to CSP restrictions.

```HTTP Header
frame-ancestors: "self" localhost:* https://your-site.com;
```

--------------------------------

### Fetch Payload REST API Collection Data

Source: https://payloadcms.com/docs/getting-started/concepts

This JavaScript snippet demonstrates how to fetch data from a Payload CMS REST API endpoint for a specific collection, such as 'pages'. It uses the `fetch` API to make a GET request, then parses the JSON response and logs it to the console. This requires a running Payload instance with a 'pages' collection.

```JavaScript
fetch('https://localhost:3000/api/pages')
.then((res) => res.json())
.then((data) => console.log(data))
```

--------------------------------

### Configure Payload CMS Search Plugin in Payload Config

Source: https://payloadcms.com/docs/plugins/search

This TypeScript/JavaScript code demonstrates how to integrate the Payload CMS Search Plugin into your Payload application's configuration. It imports the necessary modules, defines collections to be indexed by the search plugin, and sets default priorities for search results based on collection type. This setup enables automatic search record generation and management for the specified collections.

```TypeScript
import { buildConfig } from 'payload'
import { searchPlugin } from '@payloadcms/plugin-search'

const config = buildConfig({
  collections: [
    {
      slug: 'pages',
      fields: [],
    },
    {
      slug: 'posts',
      fields: [],
    },
  ],
  plugins: [
    searchPlugin({
      collections: ['pages', 'posts'],
      defaultPriorities: {
        pages: 10,
        posts: 20,
      },
    }),
  ],
})

export default config
```

--------------------------------

### Customizing Payload Blocks Field Label Components

Source: https://payloadcms.com/docs/fields/blocks

These examples illustrate how to create custom server and client components for the label of a Payload CMS Blocks field. They demonstrate how to render a custom label using Payload's `FieldLabel` component, providing flexibility in how field labels are displayed.

```typescript
import React from 'react'
import { FieldLabel } from '@payloadcms/ui'
import type { BlocksFieldLabelServerComponent } from 'payload'

export const CustomBlocksFieldLabelServer: BlocksFieldLabelServerComponent = ({
  clientField,
  path,
}) => {
  return (
    <FieldLabel
      label={clientField?.label || clientField?.name}
      path={path}
      required={clientField?.required}
    />
  )
}
```

```typescript
'use client'
import React from 'react'
import { FieldLabel } from '@payloadcms/ui'
import type { BlocksFieldLabelClientComponent } from 'payload'

export const CustomBlocksFieldLabelClient: BlocksFieldLabelClientComponent = ({
  label,
  path,
  required,
}) => {
  return (
    <FieldLabel
      label={field?.label || field?.name}
      path={path}
      required={field?.required}
    />
  )
}
```

--------------------------------

### Extend Payload CMS Globals and Hooks with Spread Syntax

Source: https://payloadcms.com/docs/plugins/build-your-own

This snippet illustrates the use of spread syntax to extend both global configurations and hook definitions in Payload CMS. For arrays like `globals`, existing elements are spread. For objects like `hooks`, existing properties are spread, ensuring that new additions don't overwrite previous configurations.

```TypeScript
config.globals = [
  ...(config.globals || []),
  // Add additional globals here
]

config.hooks = {
  ...(config.hooks || {}),
  // Add additional hooks here
}
```

--------------------------------

### Using useField Hook in a Custom Text Field Component

Source: https://payloadcms.com/docs/admin/react-hooks

Demonstrates how to import and utilize the `useField` hook within a custom React component. This example shows how to manage a field's state, including reading its `value` and updating it via `setValue` based on user input, emphasizing the requirement for client-side components.

```TypeScript
'use client'

import type { TextFieldClientComponent } from 'payload'
import { useField } from '@payloadcms/ui'

export const CustomTextField: TextFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField({ path })

  return (
    <div>
      <p>{path}</p>
      <input
        onChange={(e) => {
          setValue(e.target.value)
        }}
        value={value}
      />
    </div>
  )
}
```

--------------------------------

### Configure Basic Upload Field in Payload CMS

Source: https://payloadcms.com/docs/fields/upload

This TypeScript example demonstrates how to define a simple upload field within a Payload CMS field configuration. It sets the field type to 'upload' and specifies the related collection for uploads as 'media', which must be configured to support uploads.

```TypeScript
import type { Field } from 'payload'

export const MyUploadField: Field = {
  // ...
  type: 'upload',
  relationTo: 'media'
}
```

--------------------------------

### Create Custom editMenuItems React Server Component

Source: https://payloadcms.com/docs/custom-components/edit-view

An example of a custom component for the edit menu dropdown, implemented as a React Server Component. It receives `EditMenuItemsServerProps` and can render custom menu items, potentially linking to custom actions.

```typescript
import React from 'react'
import { PopupList } from '@payloadcms/ui'

import type { EditMenuItemsServerProps } from 'payload'

export const EditMenuItems = async (props: EditMenuItemsServerProps) => {
  const href = `/custom-action?id=${props.id}`

  return (
    <PopupList.ButtonGroup>
```

--------------------------------

### Vercel Blob Storage Plugin Configuration Options Reference

Source: https://payloadcms.com/docs/upload/storage-adapters

This API documentation outlines the configurable options for the Vercel Blob storage plugin. It lists parameters such as `enabled`, `collections`, `addRandomSuffix`, `cacheControlMaxAge`, `token`, and `clientUploads`, detailing their purpose and default values for fine-tuning storage behavior.

```APIDOC
`enabled`: Whether or not to enable the plugin (Default: `true`)
`collections`: Collections to apply the Vercel Blob adapter to
`addRandomSuffix`: Add a random suffix to the uploaded file name in Vercel Blob storage (Default: `false`)
`cacheControlMaxAge`: Cache-Control max-age in seconds (Default: `365 * 24 * 60 * 60` (1 Year))
`token`: Vercel Blob storage read/write token (Default: `''`)
`clientUploads`: Do uploads directly on the client to bypass limits on Vercel.
```

--------------------------------

### Enable Folders for a Collection in Payload CMS

Source: https://payloadcms.com/docs/folders/overview

This JavaScript example illustrates how to enable the folder feature for a specific collection, such as 'pages', within a Payload CMS configuration. Setting `folders: true` on a collection automatically adds a hidden relationship field for folder organization.

```JavaScript
import { buildConfig } from 'payload'

const config = buildConfig({
  collections: [
    {
      slug: 'pages',
      folders: true, // defaults to false
    },
  ],
})
```

--------------------------------

### Configure Basic Preview Link in Payload Collection

Source: https://payloadcms.com/docs/admin/preview

This snippet demonstrates how to configure the `admin.preview` property within a Payload Collection configuration. It sets up a basic preview link that constructs a URL using the document's slug, pointing to a local development environment. This allows editors to quickly navigate to the front-end representation of their content.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    preview: ({ slug }) => `http://localhost:3000/${slug}`,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
    },
  ],
}
```

--------------------------------

### Implement Custom Checkbox Field Label Server Component

Source: https://payloadcms.com/docs/fields/checkbox

Provides an example of a custom server-side React component for rendering the label of a Payload Checkbox Field. It uses `FieldLabel` from `@payloadcms/ui` to display the label text and handle required indicators.

```TypeScript
import React from 'react'
import { FieldLabel } from '@payloadcms/ui'
import type { CheckboxFieldLabelServerComponent } from 'payload'

export const CustomCheckboxFieldLabelServer: CheckboxFieldLabelServerComponent =
  ({ clientField, path }) => {
    return (
      <FieldLabel
        label={clientField?.label || clientField?.name}
        path={path}
        required={clientField?.required}
      />
    )
  }
```

--------------------------------

### Override Default Field Component in Payload CMS Admin

Source: https://payloadcms.com/docs/fields/overview

This example illustrates how to replace the default form field component for a specific field in the Payload CMS admin panel. It uses the `admin.components.Field` property to specify a path to a custom React component.

```TypeScript
import type { CollectionConfig } from 'payload'

export const CollectionConfig: CollectionConfig = {
  // ...
  fields: [
    // ...
    {
      // ...
      admin: {
        components: {
          Field: '/path/to/MyFieldComponent',
        },
      },
    },
  ],
}
```

--------------------------------

### Access Field Configuration in Custom Field Components

Source: https://payloadcms.com/docs/custom-components/overview

Details how custom field components receive their respective field configuration. Server Components get the full 'field' prop, while Client Components receive a simplified 'clientField' prop with non-serializable properties removed.

```typescript
import React from 'react'
import type { TextFieldServerComponent } from 'payload'

export const MyClientFieldComponent: TextFieldServerComponent = ({
  field: { name },
}) => {
  return <p>{`This field's name is ${name}`}</p>
}
```

```typescript
'use client'
import React from 'react'
import type { TextFieldClientComponent } from 'payload'

export const MyClientFieldComponent: TextFieldClientComponent = ({
  clientField: { name },
}) => {
  return <p>{`This field's name is ${name}`}</p>
}
```

--------------------------------

### Run all jobs in Payload CMS

Source: https://payloadcms.com/docs/jobs-queue/queues

Demonstrates how to run all pending jobs using `payload.jobs.run()`, including options for queue filtering, limiting, and applying `where` clauses for advanced job selection.

```javascript
const results = await payload.jobs.run()
```

```javascript
await payload.jobs.run({ queue: 'nightly', limit: 100 })
```

```javascript
await payload.jobs.run({
  where: { 'input.message': { equals: 'secret' } },
})
```

--------------------------------

### Applying Global CSS to Payload Admin Panel

Source: https://payloadcms.com/docs/admin/customizing-css

Demonstrates how to add custom global CSS to the Payload Admin Panel by modifying the `custom.scss` file. This example specifically targets the dashboard view to change its background color, illustrating how to inject custom selectors at the root level.

```CSS
.dashboard {
  background-color: red;
}
```

--------------------------------

### Payload Local API Create Operation (Access Control Skipped)

Source: https://payloadcms.com/docs/local-api/access-control

This example demonstrates a Payload local API `create` operation where access control is bypassed. By default, local API calls do not check user permissions, making them suitable for internal or server-side tasks where security context is not required.

```JavaScript
const test = await payload.create({
  collection: 'users',
  data: {
    email: 'test@test.com',
    password: 'test',
  },
})
```

--------------------------------

### Configure Payload CMS Email with Nodemailer SMTP Transport

Source: https://payloadcms.com/docs/email/overview

This example demonstrates how to configure Payload CMS to send emails using the Nodemailer adapter with SMTP transport options. It requires environment variables for SMTP host, port, user, and password.

```TypeScript
import { buildConfig } from 'payload'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'info@payloadcms.com',
    defaultFromName: 'Payload',
    // Nodemailer transportOptions
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
})
```

--------------------------------

### Payload CMS: Extending Drizzle Tables with `afterSchemaInit` Hook

Source: https://payloadcms.com/docs/database/postgres

Illustrates the use of the `afterSchemaInit` hook in Payload CMS's Postgres adapter to modify or extend Drizzle ORM tables after they have been built by Payload. This example adds an `extra_integer_column` and a composite index on `country` and `city` to the `places` collection's table, demonstrating advanced schema customization.

```TypeScript
import { postgresAdapter } from '@payloadcms/db-postgres';
import { index, integer } from '@payloadcms/db-postgres/drizzle/pg-core';
import { buildConfig } from 'payload';

export default buildConfig({
  collections: [
    {
      slug: 'places',
      fields: [
        {
          name: 'country',
          type: 'text'
        },
        {
          name: 'city',
          type: 'text'
        }
      ]
    }
  ],
  db: postgresAdapter({
    afterSchemaInit: [
      ({ schema, extendTable, adapter }) => {
        // ... (implementation for extending table)
      }
    ]
  })
});
```

--------------------------------

### Configure Next.js Rewrites for Multi-Tenant Domains

Source: https://payloadcms.com/docs/plugins/multi-tenant

Shows how to set up Next.js rewrites to handle multi-tenant routing, mapping incoming hostnames to a specific tenant domain in the URL structure, allowing for domain-specific content delivery.

```JavaScript
async rewrites() {
return [
{
source: '/((?!admin|api)):path*',
destination: '/:tenantDomain/:path*',
has: [
{
type: 'host',
value: '(?<tenantDomain>.*)'
}
]
}
];
}
```

--------------------------------

### Payload CMS Authentication: Access Control API

Source: https://payloadcms.com/docs/authentication/operations

Describes how to query user access permissions for collections and globals. This includes REST API endpoints to check overall access and specific document access, along with an example GraphQL query to retrieve access permissions for pages.

```APIDOC
GET http://localhost:3000/api/access

Additional Endpoints:
GET http://localhost:3000/api/global-slug/access
GET http://localhost:3000/api/collection-slug/access/:id
```

```APIDOC
{
  "canAccessAdmin": true,
  "collections": {
    "pages": {
      "create": {
        "permission": true
      },
      "read": {
        "permission": true
      },
      "update": {
        "permission": true
      },
      "delete": {
        "permission": true
      },
      "fields": {
        "title": {
          "create": {
            "permission": true
          },
          "read": {
            "permission": true
          },
          "update": {
            "permission": true
          }
        }
      }
    }
  }
}
```

```graphql
query {
  Access {
    pages {
      read {
        permission
      }
    }
  }
}
```

--------------------------------

### Payload CMS Admin Panel Root-Level Configuration Options

Source: https://payloadcms.com/docs/admin/overview

Documents the root-level configuration properties available for the Payload CMS Admin Panel, controlling its behavior, appearance, and user management. These options are passed directly to the `admin` key within the main Payload configuration.

```APIDOC
AdminPanelConfig:
  buildPath: string
    description: Specify an absolute path for where to store the built Admin bundle. Defaults to 'path.resolve(process.cwd(), 'build')'.
  components: object
    description: Component overrides that affect the entirety of the Admin Panel.
  custom: object
    description: Any custom properties you wish to pass to the Admin Panel.
  dateFormat: string
    description: The date format that will be used for all dates within the Admin Panel. Any valid date-fns format pattern can be used.
  livePreview: boolean
    description: Enable real-time editing for instant visual feedback of your front-end application.
  meta: object
    description: Base metadata to use for the Admin Panel.
  routes: object
    description: Replace built-in Admin Panel routes with your own custom routes.
  suppressHydrationWarning: boolean
    description: If set to 'true', suppresses React hydration mismatch warnings during the hydration of the root '<html>' tag. Defaults to 'false'.
  theme: string
    description: Restrict the Admin Panel theme to use only one of your choice. Default is 'all'.
  timezones: object
    description: Configure the timezone settings for the admin panel.
  user: string
    description: The 'slug' of the Collection that you want to allow to login to the Admin Panel.
```

--------------------------------

### Define Payload Collection with JSON Field in TypeScript

Source: https://payloadcms.com/docs/fields/json

This example demonstrates how to integrate a JSON field into a Payload CMS collection configuration. It defines a collection named 'example-collection' and includes a required JSON field named 'customerJSON', showcasing a practical implementation of the JSON field type.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'customerJSON', // required
      type: 'json', // required
      required: true,
    },
  ],
}
```

--------------------------------

### Configure Slate Editor on a Rich Text Field

Source: https://payloadcms.com/docs/rich-text/slate

This example shows how to apply and customize the Slate editor on a specific richText field within a CollectionConfig. It allows for fine-grained control over the editor's behavior, including specifying allowed `elements` and `leaves` within the admin panel for that particular field.

```TypeScript
import type { CollectionConfig } from 'payload'
import { slateEditor } from '@payloadcms/richtext-slate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    {
      name: 'content',
      type: 'richText',
      // Pass the Slate editor here and configure it accordingly
      editor: slateEditor({
        admin: {
          elements: [
            // customize elements allowed in Slate editor here
          ],
          leaves: [
            // customize leaves allowed in Slate editor here
          ]
        }
      })
    }
  ]
}
```

--------------------------------

### PayloadCMS `afterRead` Field Hook for Date Formatting

Source: https://payloadcms.com/docs/hooks/fields

This example demonstrates the `afterRead` hook for a `dateField`. This hook is invoked after a field value is read from the database, making it perfect for formatting or transforming data for display purposes, such as converting a date string into a user-friendly locale-specific format.

```typescript
import type { Field } from 'payload'

const dateField: Field = {
  name: 'createdAt',
  type: 'date',
  hooks: {
    afterRead: [
      ({ value }) => {
        // Format date for display
        return new Date(value).toLocaleDateString()
      }
    ]
  }
}
```

--------------------------------

### Define Basic Number Field in Payload CMS

Source: https://payloadcms.com/docs/fields/number

This snippet demonstrates how to define a basic number field within a Payload CMS field configuration by setting its type to 'number'. It shows the minimal setup required to include a number field in your data model.

```TypeScript
import type { Field } from 'payload'

export const MyNumberField: Field = {
  // ...
  type: 'number'
}
```

--------------------------------

### Query Data by Tenant in Frontend Application

Source: https://payloadcms.com/docs/plugins/multi-tenant

Illustrates how to query data from a PayloadCMS collection in a frontend application, filtering results based on a selected tenant's slug using the 'where' clause in the payload.find method.

```JavaScript
const pagesBySlug = await payload.find({
collection: 'pages',
depth: 1,
draft: false,
limit: 1000,
overrideAccess: false,
where: {
'tenant.slug': {
equals: 'gold'
}
}
})
```

--------------------------------

### PayloadCMS `beforeChange` Field Hook for Operation-Specific Logic

Source: https://payloadcms.com/docs/hooks/fields

This example illustrates the `beforeChange` hook applied to an `emailField`. This hook runs immediately after validation and allows for additional validation or transformation based on the operation type (e.g., 'create'). This ensures field data is valid before being saved to the document.

```typescript
import type { Field } from 'payload'

const emailField: Field = {
  name: 'email',
  type: 'email',
  hooks: {
    beforeChange: [
      ({ value, operation }) => {
        if (operation === 'create') {
          // Perform additional validation or transformation for 'create' operation
        }
        return value
      }
    ]
  }
}
```

--------------------------------

### Payload GraphQL Mutations for User Preferences

Source: https://payloadcms.com/docs/graphql/overview

Table listing the automatically generated GraphQL mutations available for user preferences, including `update` and `delete` operations.

```APIDOC
Query Name | Operation
--- | ---
`updatePreference` | `update`
`deletePreference` | `delete`
```

--------------------------------

### Configure Form Builder Plugin Fields Option

Source: https://payloadcms.com/docs/plugins/form-builder

Example of configuring the `fields` option for the Payload Form Builder plugin. This object defines which field types are allowed for admin editors to use when building forms, with boolean values controlling their availability.

```TypeScript
// payload.config.ts
formBuilderPlugin({
  // ...
  fields: {
    text: true,
    textarea: true,
    select: true,
    email: true,
    state: true,
    country: true,
    checkbox: true,
    number: true,
    message: true,
    date: false,
    payment: false,
  },
})
```

--------------------------------

### Configure Query Presets at Payload Root Config

Source: https://payloadcms.com/docs/query-presets/overview

This snippet illustrates how to define global settings and behaviors for Query Presets within the main Payload configuration. The `queryPresets` property at the root of the `buildConfig` object allows for customization of access control, constraints, and labels.

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  queryPresets: {
    // ...
  },
})
```

--------------------------------

### Query Points Intersecting a GeoJSON Polygon

Source: https://payloadcms.com/docs/fields/point

This example demonstrates how to use the `intersects` operator to query documents where a point field's coordinates intersect a given GeoJSON polygon. Similar to `within`, the polygon is defined by an array of longitude/latitude pairs.

```TypeScript
const polygon: Point[] = [
  [9.0, 19.0], // bottom-left
  [9.0, 21.0], // top-left
  [11.0, 21.0], // top-right
  [11.0, 19.0], // bottom-right
  [9.0, 19.0]  // back to starting point to close the polygon
];

payload.find({
  collection: 'points',
  where: {
    point: {
      intersects: {
        type: 'Polygon',
        coordinates: [polygon]
      }
    }
  }
});
```

--------------------------------

### Configure Custom Admin Header in Payload CMS

Source: https://payloadcms.com/docs/custom-components/root-components

This snippet shows how to inject custom components above the Payload admin header, useful for announcements or notifications. It requires setting the `admin.components.Header` property in the Payload configuration to an array of component paths, followed by an example of a simple React component for the header.

```TypeScript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    components: {
      Header: ['/path/to/your/component'],
    },
  },
})
```

```JavaScript
export default function MyCustomHeader() {
  return (
    <header>
      <h1>My Custom Header</h1>
    </header>
  )
}
```

--------------------------------

### Lexical Plugin to Insert Custom Node via Command

Source: https://payloadcms.com/docs/rich-text/custom-features

This example demonstrates a Lexical plugin (`MyNodePlugin`) that registers a custom command (`INSERT_MYNODE_COMMAND`). When this command is executed, it inserts a new instance of `MyNode` into the editor at the current selection. It utilizes `useLexicalComposerContext` to access the editor instance and `useEffect` to register the command.

```typescript
'use client'
import type { LexicalCommand } from '@payloadcms/richtext-lexical/lexical'

import {
  createCommand,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from '@payloadcms/richtext-lexical/lexical'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@payloadcms/richtext-lexical/lexical/utils'
import { useEffect } from 'react'

import type { PluginComponent } from '@payloadcms/richtext-lexical'

import { $createMyNode } from '../nodes/MyNode'
import './index.scss'

export const INSERT_MYNODE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_MYNODE_COMMAND',
)

export const MyNodePlugin: PluginComponent = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_MYNODE_COMMAND,
      (type) => {
        const selection = $getSelection()

        if (!$isRangeSelection(selection)) {
          return false
        }

        const focusNode = selection.focus.getNode()

        if (focusNode !== null) {
          const newMyNode = $createMyNode()
          $insertNodeToNearestRoot(newMyNode)
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
```

--------------------------------

### Resend Adapter Configuration Options

Source: https://payloadcms.com/docs/email/overview

Documentation for the `resendAdapter` options, specifically detailing the `apiKey` parameter required for authentication with the Resend service.

```APIDOC
resendAdapter(options: object):
  options:
    apiKey: string
      description: The API key for the Resend service.
```

--------------------------------

### Building a Paginated List GraphQL Type

Source: https://payloadcms.com/docs/graphql/extending

Example demonstrating the use of `buildPaginatedListType` utility to create a new GraphQL type for paginated results. This utility function takes the name of the new schema type and the GraphQL type to be used for the documents parameter, similar to Payload's generated schema.

```JavaScript
import { buildPaginatedListType } from '@payloadcms/graphql/types'

export const getMyPosts = (GraphQL, payload) => {
  return {
    args: {},
    resolve: Resolver,
    type: buildPaginatedListType(
      'AuthorPosts',
      payload.collections['posts'].graphQL?.type,
    ),
  }
}
```

--------------------------------

### Integrate Existing Drizzle Schema Tables into Payload via beforeSchemaInit

Source: https://payloadcms.com/docs/database/sqlite

This example shows how to import pre-defined Drizzle schema tables (like `users` and `countries` from an external `schema.ts` file) and append them to Payload's database schema using the `beforeSchemaInit` hook. This allows Payload to recognize and interact with existing tables while managing its own collections.

```typescript
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { users, countries } from '../drizzle/schema'

sqliteAdapter({
  beforeSchemaInit: [
    ({ schema, adapter }) => {
      return {
        ...schema,
        tables: {
          ...schema.tables,
          users,
          countries
        }
      }
    }
  ]
})
```

--------------------------------

### Upload File via REST API with FormData in JavaScript

Source: https://payloadcms.com/docs/upload/overview

This JavaScript example demonstrates how to upload a file to a Payload CMS collection using the REST API. It constructs a `FormData` object, appends the file, and shows how to include additional JSON-stringified fields for the collection schema. The request is sent as `multipart/form-data` using `fetch`.

```javascript
const fileInput = document.querySelector('#your-file-input')
const formData = new FormData()

formData.append('file', fileInput.files[0])

// Replace with the fields defined in your upload-enabled collection.
// The example below includes an optional field like 'title'.
formData.append(
  '_payload',
  JSON.stringify({
    title: 'Example Title',
    description: 'An optional description for the file',
  }),
)

fetch('api/:upload-slug', {
  method: 'POST',
  body: formData,
  /**
   * Do not manually add the Content-Type Header
   * the browser will handle this.
   *
   * headers: {
   * 'Content-Type': 'multipart/form-data'
   * }
   */
})
```

--------------------------------

### Define a Workflow in Payload CMS Configuration

Source: https://payloadcms.com/docs/jobs-queue/workflows

This example demonstrates how to define a workflow within your Payload configuration's `jobs.workflows` array. It includes defining an `inputSchema` for workflow arguments and a `handler` function that orchestrates predefined tasks like `createPost` and `updatePost`, showcasing how to pass data between tasks and ensure unique task invocation IDs for retry resilience.

```TypeScript
export default buildConfig({
  // ...
  jobs: {
    tasks: [
      // ...
    ],
    workflows: [
      {
        slug: 'createPostAndUpdate',

        // The arguments that the workflow will accept
        inputSchema: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
        ],

        // The handler that defines the "control flow" of the workflow
        // Notice how it uses the `tasks` argument to execute your predefined tasks.
        // These are strongly typed!
        handler: async ({ job, tasks }) => {

          // This workflow first runs a task called `createPost`.

          // You need to define a unique ID for this task invocation
          // that will always be the same if this workflow fails
          // and is re-executed in the future. Here, we hard-code it to '1'
          const output = await tasks.createPost('1', {
            input: {
              title: job.input.title,
            },
          })

          // Once the prior task completes, it will run a task
          // called `updatePost`
          await tasks.updatePost('2', {
            input: {
              post: job.taskStatus.createPost['1'].output.postID, // or output.postID
              title: job.input.title + '2',
            },
          })
        },
      } as WorkflowConfig<'updatePost'>
    ]
  }
})
```

--------------------------------

### Recommended GraphQL Directory Structure for Payload CMS

Source: https://payloadcms.com/docs/graphql/extending

Illustrates a common and recommended directory structure for organizing GraphQL queries and mutations within a Payload CMS application, grouping related files and resolvers for better organization.

```plaintext
src/graphql
├── queries/
│   ├── index.ts
│   └── myCustomQuery/
│       ├── index.ts
│       └── resolver.ts
└── mutations/
```

--------------------------------

### Payload Collection Upload Configuration Options Reference

Source: https://payloadcms.com/docs/upload/overview

This section provides a comprehensive reference for the `upload` property options available within a Payload CMS Collection configuration. Each option controls specific aspects of file upload behavior, Admin Panel display, and storage. It details properties like `adminThumbnail`, `bulkUpload`, `crop`, `imageSizes`, and more, along with their descriptions and default behaviors.

```APIDOC
Collection Upload Options:
  adminThumbnail:
    Description: Set the way that the Admin Panel will display thumbnails for this Collection.
    More Info: #admin-thumbnails
  bulkUpload:
    Description: Allow users to upload in bulk from the list view, default is true.
  cacheTags:
    Description: Set to false to disable the cache tag set in the UI for the admin thumbnail component. Useful for when CDNs don't allow certain cache queries.
  crop:
    Description: Set to false to disable the cropping tool in the Admin Panel. Crop is enabled by default.
    More Info: #crop-and-focal-point-selector
  disableLocalStorage:
    Description: Completely disable uploading files to disk locally.
    More Info: #disabling-local-upload-storage
  displayPreview:
    Description: Enable displaying preview of the uploaded file in Upload fields related to this Collection. Can be locally overridden by displayPreview option in Upload field.
    More Info: ../fields/upload#config-options
  externalFileHeaderFilter:
    Description: Accepts existing headers and returns the headers after filtering or modifying.
  filesRequiredOnCreate:
    Description: Mandate file data on creation, default is true.
  filenameCompoundIndex:
    Description: Field slugs to use for a compound index instead of the default filename index.
  focalPoint:
    Description: Set to false to disable the focal point selection tool in the Admin Panel. The focal point selector is only available when imageSizes or resizeOptions are defined.
    More Info: #crop-and-focal-point-selector
  formatOptions:
    Description: An object with format and options that are used with the Sharp image library to format the upload file.
    More Info: https://sharp.pixelplumbing.com/api-output#toformat
  handlers:
    Description: Array of Request handlers to execute when fetching a file, if a handler returns a Response it will be sent to the client. Otherwise Payload will retrieve and send back the file.
  imageSizes:
    Description: If specified, image uploads will be automatically resized in accordance to these image sizes.
    More Info: #image-sizes
```

--------------------------------

### Payload CMS Admin Description Function Arguments

Source: https://payloadcms.com/docs/fields/overview

Documentation for arguments passed to the `admin.description` function in Payload CMS, specifically the `t` function used for internationalizing the Admin Panel.

```APIDOC
admin.description function arguments:
  t: The t function used to internationalize the Admin Panel.
```

--------------------------------

### Access Default Props in PayloadCMS React Server Component

Source: https://payloadcms.com/docs/custom-components/overview

Shows an example of a React Server Component in PayloadCMS that automatically receives default props like `payload` and `i18n`. The snippet demonstrates how to use the `payload` object to fetch data from a collection, simplifying data access within custom components.

```javascript
import React from 'react'
import type { Payload } from 'payload'

async function MyServerComponent({
  payload,
}: {
  payload: Payload
}) {
  const page = await payload.findByID({
    collection: 'pages',
    id: '123',
  })

  return <p>{page.title}</p>
}
```

--------------------------------

### Import Payload Configuration Types

Source: https://payloadcms.com/docs/configuration/overview

Shows how to import `Config` and `SanitizedConfig` types from the 'payload' module to enable type-safe configuration writing. `Config` represents the raw configuration, while `SanitizedConfig` is used internally after sanitization.

```typescript
import type { Config, SanitizedConfig } from 'payload'
```

--------------------------------

### Define Server Feature with Asynchronous Initialization

Source: https://payloadcms.com/docs/rich-text/custom-features

This example demonstrates how to define a server-side rich-text feature in Payload CMS using an asynchronous function for its `feature` property. This allows for sanitizing props and other asynchronous operations during feature loading, providing flexibility in feature initialization.

```typescript
import { createServerFeature } from '@payloadcms/richtext-lexical'

createServerFeature({
//...
feature: async ({
config,
isRoot,
props,
resolvedFeatures,
unSanitizedEditorConfig,
featureProviderMap,
}) => {
return {
//Actual server feature here...
}
},
})
```

--------------------------------

### Define Server Feature with Priority Dependencies

Source: https://payloadcms.com/docs/rich-text/custom-features

This example demonstrates how to specify priority dependencies for a Payload CMS rich-text feature using the `dependenciesPriority` property. Features listed here must be loaded first and exist, otherwise an error will be thrown, ensuring critical features are available in the correct load order.

```typescript
import { createServerFeature } from '@payloadcms/richtext-lexical'

export const MyFeature = createServerFeature({
feature: ({ featureProviderMap }) => {
return {
// ...
}
},
key: 'myFeature',
dependenciesPriority: ['otherFeature'],
})
```

--------------------------------

### Implement Custom Publish Button (Client Component)

Source: https://payloadcms.com/docs/custom-components/edit-view

This example shows a custom 'Publish' button implemented as a client-side React component. It wraps the default `PublishButton` from `@payloadcms/ui` and demonstrates passing a custom `label` prop, allowing for client-side customization of the button's appearance or behavior.

```tsx
'use client'
import React from 'react'
import { PublishButton } from '@payloadcms/ui'
import type { PublishButtonClientProps } from 'payload'

export function MyPublishButton(props: PublishButtonClientProps) {
  return <PublishButton label="Publish" />
}
```

--------------------------------

### Customize Email Verification HTML in Payload

Source: https://payloadcms.com/docs/authentication/email

This example shows how to use the `generateEmailHTML` function within the `auth.verify` configuration to customize the HTML content of email verification messages. It provides access to `req`, `token`, and `user` to construct a dynamic verification URL and email body.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  // ...
  auth: {
    verify: {
      generateEmailHTML: ({ req, token, user }) => {
        // Use the token provided to allow your user to verify their account
        const url = `https://yourfrontend.com/verify?token=${token}`

        return `Hey ${user.email}, verify your email by clicking here: ${url}`
      },
    },
  },
}
```

--------------------------------

### Implement `beforeSync` Hook for Search Records

Source: https://payloadcms.com/docs/plugins/search

This snippet demonstrates the implementation of the `beforeSync` hook within the PayloadCMS search plugin. This hook, which functions as an `afterChange` hook, allows developers to modify the data of a search record before it is created or updated. The example shows how to add or override an 'excerpt' field, providing a fallback value if the original document lacks one.

```JavaScript
searchPlugin({
  beforeSync: ({ originalDoc, searchDoc }) => ({
    ...searchDoc,
    excerpt: originalDoc?.excerpt || 'This is a fallback excerpt',
  }),
}),
```

--------------------------------

### Access Drizzle ORM for Advanced Database Queries

Source: https://payloadcms.com/docs/database/sqlite

This example demonstrates how to leverage the full power of Drizzle ORM directly through Payload's database adapter. It shows importing generated table schemas and Drizzle's query functions, then executing complex queries like `findMany` and `select` with `where` clauses, enabling advanced data manipulation beyond standard Payload operations.

```TypeScript
// Import table from the generated file
import { posts } from './payload-generated-schema'
// To avoid installing Drizzle, you can import everything that drizzle has from our re-export path.
import { eq, sql, and } from '@payloadcms/db-sqlite/drizzle'

// Drizzle's Querying API: https://orm.drizzle.team/docs/rqb
const posts = await payload.db.drizzle.query.posts.findMany()
// Drizzle's Select API https://orm.drizzle.team/docs/select
const result = await payload.db.drizzle
  .select()
  .from(posts)
  .where(
    and(eq(posts.id, 50), sql`lower(${posts.title}) = 'example post title'`), 
  )
```

--------------------------------

### Initialize Component with useListQuery Hook

Source: https://payloadcms.com/docs/admin/react-hooks

This snippet shows the basic import and initialization of the `useListQuery` hook within a React functional component. The `useListQuery` hook is designed for subscribing to data, current query, and other properties used within the Payload CMS List View, making it suitable for custom components rendered in that context.

```JavaScript
'use client'
import { useListQuery } from '@payloadcms/ui'

const MyComponent: React.FC = () => {

```

--------------------------------

### Combine Queries with AND/OR Logic in Payload CMS (TypeScript)

Source: https://payloadcms.com/docs/queries/overview

This example illustrates how to construct complex queries in Payload CMS by combining multiple conditions using 'and' and 'or' logical operators. Queries can be nested to create sophisticated filtering rules, such as finding documents where 'color' is 'mint' OR ('color' is 'white' AND 'featured' is false).

```TypeScript
import type { Where } from 'payload'

const query: Where = {
  or: [
    {
      color: {
        equals: 'mint',
      },
    },
    {
      and: [
        {
          color: {
            equals: 'white',
          },
        },
        {
          featured: {
            equals: false,
          },
        },
      ],
    },
  ],
}
```

--------------------------------

### Payload Local API: Exclude Fields (Exclude Mode)

Source: https://payloadcms.com/docs/queries/select

Illustrates how to use the `select` option in Payload's Local API `payload.find` method to exclude specific fields by setting their value to `false`. This effectively selects all other fields in the document. This example excludes 'array' and 'group.number'.

```TypeScript
const getPosts = async (payload: Payload) => {
  const posts = await payload.find({
    collection: 'posts',
    // Select everything except for array and group.number
    select: {
      array: false,
      group: {
        number: false,
      },
    },
  })

  return posts
}
```

--------------------------------

### Configure `package.json` Scripts for Payload Migrations in CI

Source: https://payloadcms.com/docs/database/migrations

This `package.json` script configuration demonstrates how to integrate Payload CMS migrations into your continuous integration (CI) build process. The `ci` script ensures that all pending migrations are executed against your production database before the application build commences, which is ideal for platforms like Payload Cloud, Vercel, or Netlify.

```JSON
"scripts": {
  // For running in dev mode
  "dev": "next dev --turbo",

  // To build your Next + Payload app for production
  "build": "next build",

  // A "tie-in" to Payload's CLI for convenience
  // this helps you run `pnpm payload migrate:create` and similar
  "payload": "cross-env NODE_OPTIONS=--no-deprecation payload",

  // This command is what you'd set your `build script` to.
  // Notice how it runs `payload migrate` and then `pnpm build`?
  // This will run all migrations for you before building, in your CI,
  // against your production database
  "ci": "payload migrate && pnpm build"
}
```

--------------------------------

### Implement Custom Publish Button (Server Component)

Source: https://payloadcms.com/docs/custom-components/edit-view

This example shows a custom 'Publish' button implemented as a server-side React component. It wraps the default `PublishButton` from `@payloadcms/ui` and demonstrates how to pass a custom `label` prop to modify the button's displayed text.

```tsx
import React from 'react'
import { PublishButton } from '@payloadcms/ui'
import type { PublishButtonClientProps } from 'payload'

export function MyPublishButton(props: PublishButtonServerProps) {
  return <PublishButton label="Publish" />
}
```

--------------------------------

### Create a Basic Custom Payload CMS Admin View Component

Source: https://payloadcms.com/docs/custom-components/custom-views

This example demonstrates how to create a simple custom view component for the Payload CMS admin panel. It's a functional React component that receives `AdminViewServerProps` and renders a basic heading and paragraph within a Gutter component, serving as a custom root view.

```TypeScript
import type { AdminViewServerProps } from 'payload'

import { Gutter } from '@payloadcms/ui'
import React from 'react'

export function MyCustomView(props: AdminViewServerProps) {
  return (
    <Gutter>
      <h1>Custom Default Root View</h1>
      <p>This view uses the Default Template.</p>
    </Gutter>
  )
}
```

--------------------------------

### Lexical Editor Built-in Features Overview

Source: https://payloadcms.com/docs/rich-text/overview

An overview of some of the built-in features available in the Lexical editor, indicating their name, whether they are included by default, and a brief description of their functionality.

```APIDOC
Feature Name | Included by default | Description
--- | --- | ---
BoldFeature | Yes | Handles the bold text format
```

--------------------------------

### Execute Nested Tasks in Payload CMS

Source: https://payloadcms.com/docs/jobs-queue/tasks

This example shows how to run sub-tasks within an existing parent task in Payload CMS. It demonstrates both `inlineTask` for defining a sub-task directly within the handler and `tasks.CreateSimple` for invoking a pre-defined task. It also highlights the recommendation to enable `addParentToTaskLog` for improved observability and debugging of task execution flows.

```TypeScript
export default buildConfig({
  // ...
  jobs: {
    // It is recommended to set `addParentToTaskLog` to `true` when using nested tasks, so that the parent task is included in the task log
    // This allows for better observability and debugging of the task execution
    addParentToTaskLog: true,
    tasks: [
      {
        slug: 'parentTask',
        inputSchema: [
          {
            name: 'text',
            type: 'text',
          },
        ],
        handler: async ({ input, req, tasks, inlineTask }) => {
          await inlineTask('Sub Task 1', {
            task: () => {
              // Do something
              return {
                output: {},
              }
            },
          })

          await tasks.CreateSimple('Sub Task 2', {
            input: { message: 'hello' },
          })

          return {
            output: {},
          }
        },
      } as TaskConfig<'parentTask'>,
    ],
  },
})
```

--------------------------------

### Implementing a Custom Lexical DecoratorNode for Payload CMS

Source: https://payloadcms.com/docs/rich-text/custom-features

This comprehensive example details the creation of a custom Lexical `DecoratorNode` in TypeScript for Payload CMS. It covers essential aspects such as type definitions (`SerializedMyNode`), static methods for cloning, type identification, DOM conversion (`importDOM`), JSON serialization/deserialization (`importJSON`), and rendering logic (`createDOM`, `decorate`), allowing for custom React component integration within the editor.

```typescript
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  SerializedLexicalNode
} from '@payloadcms/richtext-lexical/lexical'

import { $applyNodeReplacement, DecoratorNode } from '@payloadcms/richtext-lexical/lexical'

// SerializedLexicalNode is the default lexical node.
// By setting your SerializedMyNode type to SerializedLexicalNode,
// you are basically saying that this node does not save any additional data.
// If you want your node to save data, feel free to extend it
export type SerializedMyNode = SerializedLexicalNode

// Lazy-import the React component to your node here
const MyNodeComponent = React.lazy(() =>
  import('../component/index.js').then((module) => ({
    default: module.MyNodeComponent
  }))
)

/**
 * This node is a DecoratorNode. DecoratorNodes allow you to render React components in the editor.
 *
 * They need both createDom and decorate functions. createDom => outside of the html. decorate => React Component inside of the html.
 *
 * If we used DecoratorBlockNode instead, we would only need a decorate method
 */
export class MyNode extends DecoratorNode<React.ReactElement> {
  static clone(node: MyNode): MyNode {
    return new MyNode(node.__key)
  }

  static getType(): string {
    return 'myNode'
  }

  /**
   * Defines what happens if you copy a div element from another page and paste it into the lexical editor
   *
   * This also determines the behavior of lexical's internal HTML -> Lexical converter
   */
  static importDOM(): DOMConversionMap | null {
    return {
      div: () => ({
        conversion: $yourConversionMethod,
        priority: 0
      })
    }
  }

  /**
   * The data for this node is stored serialized as JSON. This is the "load function" of that node: it takes the saved data and converts it into a node.
   */
  static importJSON(serializedNode: SerializedMyNode): MyNode {
    return $createMyNode()
  }

  /**
   * Determines how the hr element is rendered in the lexical editor. This is only the "initial" / "outer" HTML element.
   */
  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('div')
    return element
  }

  /**
   * Allows you to render a React component within whatever createDOM returns.
   */
```

--------------------------------

### Payload CMS Local API: Find Collection Version by ID

Source: https://payloadcms.com/docs/versions/overview

Example of using the Payload CMS Local API `payload.findVersionByID` method to retrieve a specific version of a collection document by its ID. Shows required parameters like `collection` and `id`, along with optional parameters for depth, locale, and access control.

```JavaScript
const result = await payload.findVersionByID({
  collection: 'posts', // required
  id: '507f1f77bcf86cd799439013', // required
  depth: 2,
  locale: 'en',
  fallbackLocale: false,
  user: dummyUser,
  overrideAccess: false,
  showHiddenFields: true,
})
```

--------------------------------

### Configure AWS S3 Storage Plugin in Payload CMS

Source: https://payloadcms.com/docs/upload/storage-adapters

This TypeScript code snippet demonstrates how to configure the `s3Storage` plugin within your Payload CMS `buildConfig`. It shows how to specify which collections should utilize S3 for file storage. The `config` object within `s3Storage` expects an `S3ClientConfig` from `@aws-sdk/client-s3` for detailed AWS setup.

```TypeScript
import { s3Storage } from '@payloadcms/storage-s3'
import { Media } from './collections/Media'
import { MediaWithPrefix } from './collections/MediaWithPrefix'

export default buildConfig({
  collections: [Media, MediaWithPrefix],
  plugins: [
    s3Storage({
      collections: {
        media: true,
        'media-with-prefix': {

```

--------------------------------

### Configure Admin Options for Payload Select Field

Source: https://payloadcms.com/docs/fields/select

This example shows how to define a Payload CMS field with custom `admin` options. The `admin` property allows developers to customize the appearance and behavior of the field within the Payload Admin Panel, inheriting default configurations and adding specific ones for the Select field.

```typescript
import type { Field } from 'payload'

export const MySelectField: Field = {
  // ...
  admin: {
    // ...
  },
}
```

--------------------------------

### Access Custom Translations in a React Component with Payload CMS

Source: https://payloadcms.com/docs/configuration/i18n

This example illustrates how to use the `useTranslation` hook from `@payloadcms/ui` within a React component. It demonstrates passing custom translation types to the hook, allowing strongly-typed access to both default and custom translation keys.

```TypeScript
// <rootDir>/components/MyComponent.tsx

'use client'
import type React from 'react'
import { useTranslation } from '@payloadcms/ui'

import type {
  CustomTranslationsObject,
  CustomTranslationsKeys,
} from '../custom-translations'

export const MyComponent: React.FC = () => {
  const { i18n, t } = useTranslation<
    CustomTranslationsObject,
    CustomTranslationsKeys
  >() // These generics merge your custom translations with the default client translations

  return t('general:myCustomKey')
}
```

--------------------------------

### Register Custom Nodes in a Server Feature

Source: https://payloadcms.com/docs/rich-text/custom-features

This snippet demonstrates how to register custom nodes within a server-side feature using the `createNode` helper. It includes an example of defining an HTML converter for the node, which is used for headless editor operations like HTML conversion.

```TypeScript
import { createServerFeature, createNode } from '@payloadcms/richtext-lexical'
import { MyNode } from './nodes/MyNode'

export const MyFeature = createServerFeature({
feature: {
nodes: [
// Use the createNode helper function to more easily create nodes with proper typing
createNode({
converters: {
html: {
converter: () => {
return `<hr/>`
},
nodeTypes: [MyNode.getType()],
},
},
// Here you can add your actual node. On the server, they will be
// used to initialize a headless editor which can be used to perform
// operations on the editor, like markdown / html conversion.
node: MyNode,
}),
],
},
key: 'myFeature',
})
```

--------------------------------

### Implement Custom Payload CMS Array Field Client Component

Source: https://payloadcms.com/docs/fields/array

This example shows how to define a custom client-side React component for the Payload CMS Array Field. It's marked with `'use client'` for client-side rendering and simply wraps the base `ArrayField` component.

```TypeScript
'use client'
import React from 'react'
import { ArrayField } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'

export const CustomArrayFieldClient: ArrayFieldClientComponent = (props) => {
  return <ArrayField {...props} />
}
```

--------------------------------

### Override Search Collection Configuration

Source: https://payloadcms.com/docs/plugins/search

This code illustrates how to use the `searchOverrides` option to customize the automatically generated `search` collection. It shows how to change the collection's slug and, more importantly, how to extend its fields. The example adds an 'excerpt' field of type 'textarea' with a specific admin position, demonstrating how to merge custom fields with the plugin's default fields.

```JavaScript
searchPlugin({
  searchOverrides: {
    slug: 'search-results',
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'excerpt',
        type: 'textarea',
        admin: {
          position: 'sidebar',
        },
      },
    ],
  },
}),
```

--------------------------------

### Implement Custom Collection/Global Description Component in Payload CMS

Source: https://payloadcms.com/docs/custom-components/edit-view

Shows how to add a custom `Description` component to Payload CMS collections or globals. It includes the configuration required in `CollectionConfig` (or `GlobalConfig`) to specify the component path, and provides examples for both server-side and client-side React components that render the custom description.

```typescript
import type { CollectionConfig } from 'payload';

export const MyCollection: CollectionConfig = {
  // ...
  admin: {
    components: {
      Description: '/path/to/MyDescriptionComponent'
    }
  }
};
```

```typescript
import React from 'react';
import type { ViewDescriptionServerProps } from 'payload';

export function MyDescriptionComponent(props: ViewDescriptionServerProps) {
  return <div>This is a custom description component (Server)</div>;
}
```

```typescript
'use client';
import React from 'react';
import type { ViewDescriptionClientProps } from 'payload';

export function MyDescriptionComponent(props: ViewDescriptionClientProps) {
  return <div>This is a custom description component (Client)</div>;
}
```

--------------------------------

### Custom Select Field Label Server Component for Payload CMS

Source: https://payloadcms.com/docs/fields/select

This example shows how to create a custom server-side React component specifically for the label of a Payload CMS Select field. It uses `SelectFieldLabelServerComponent` and the `FieldLabel` component from `@payloadcms/ui` to render a customizable label, including its text and required status.

```typescript
import React from 'react'
import { FieldLabel } from '@payloadcms/ui'
import type { SelectFieldLabelServerComponent } from 'payload'

export const CustomSelectFieldLabelServer: SelectFieldLabelServerComponent = ({
  clientField,
  path,
}) => {
  return (
    <FieldLabel
      label={clientField?.label || clientField?.name}
      path={path}
      required={clientField?.required}
    />
  )
}
```

--------------------------------

### Mutate Raw Payload SQL Schema with beforeSchemaInit Hook

Source: https://payloadcms.com/docs/database/postgres

This example illustrates how to use the `beforeSchemaInit` hook within the `postgresAdapter` to directly modify Payload's internal raw SQL schema. This powerful feature allows developers to add entirely new tables, append custom columns to existing Payload-generated tables, and define unique indexes that might not be automatically handled by Payload's Drizzle schema generation process.

```typescript
import { postgresAdapter } from '@payloadcms/db-postgres'

postgresAdapter({
  beforeSchemaInit: [
    ({ schema, adapter }) => {
      // Add a new table
      adapter.rawTables.myTable = {
        name: 'my_table',
        columns: {
          my_id: {
            name: 'my_id',
            type: 'serial',
            primaryKey: true,
          },
        },
      }

      // Add a new column to generated by Payload table:
      adapter.rawTables.posts.columns.customColumn = {
        name: 'custom_column',
        // Note that Payload SQL doesn't support everything that Drizzle does.
        type: 'integer',
        notNull: true,
      }
      // Add a new index to generated by Payload table:
      adapter.rawTables.posts.indexes.customColumnIdx = {
        name: 'custom_column_idx',
        unique: true,
        on: ['custom_column'],
      }

      return schema
    },
  ],
})
```

--------------------------------

### Global beforeChange Hook Arguments Reference

Source: https://payloadcms.com/docs/hooks/globals

This API documentation outlines the arguments available to the `beforeChange` hook. It includes `global` for the current global context, `context` for shared data, `data` for the incoming document data, `originalDoc` representing the document before changes, and the `req` object.

```APIDOC
GlobalBeforeChangeHook Arguments:
  global: The Global in which this Hook is running against.
  context: Custom context passed between hooks.
  data: The incoming data passed through the operation.
  originalDoc: The Document before changes are applied.
  req: The Web Request object. This is mocked for Local API operations.
```

--------------------------------

### Payload Database Transaction API

Source: https://payloadcms.com/docs/database/transactions

This section documents the core functions provided by Payload's database adapter for direct transaction management. These functions allow developers to programmatically start, commit, and rollback database transactions, offering fine-grained control over data consistency outside of Payload's default request-based transaction handling.

```APIDOC
payload.db.beginTransaction:
  description: Starts a new session and returns a transaction ID for use in other Payload Local API calls.
  parameters: None
  returns: Promise<string> - A unique transaction identifier.

payload.db.commitTransaction:
  description: Takes the identifier for the transaction, finalizes any changes.
  parameters:
    - name: transactionID
      type: string
      description: The ID of the transaction to commit.
  returns: Promise<void>

payload.db.rollbackTransaction:
  description: Takes the identifier for the transaction, discards any changes.
  parameters:
    - name: transactionID
      type: string
      description: The ID of the transaction to rollback.
  returns: Promise<void>
```

--------------------------------

### Run Lexical Migration Script

Source: https://payloadcms.com/docs/rich-text/migration

This snippet demonstrates how to import and execute the `migrateSlateToLexical` function provided by Payload CMS. This function is designed for bulk conversion of existing Slate rich text data to the Lexical format across your database. It requires the `payload` object as an argument and should be run after backing up your data.

```typescript
import { migrateSlateToLexical } from '@payloadcms/richtext-lexical/migrate'

await migrateSlateToLexical({ payload })
```

--------------------------------

### Authenticate API Requests with Payload API Key using Fetch

Source: https://payloadcms.com/docs/authentication/api-keys

This JavaScript example shows how to make an authenticated API request using the Fetch API with a Payload API key. The `Authorization` header is constructed by concatenating the collection's slug, ' API-Key ', and the actual API key. Payload's built-in middleware uses this header to identify the associated user and apply proper access control.

```javascript
import Users from '../collections/Users'

const response = await fetch('http://localhost:3000/api/pages', {
  headers: {
    Authorization: `${Users.slug} API-Key ${YOUR_API_KEY}`,
  },
})
```

--------------------------------

### Configure Custom Collection Views in Payload CMS Admin Panel

Source: https://payloadcms.com/docs/custom-components/custom-views

This example shows how to configure custom views for specific collections in Payload CMS. It uses the `admin.components.views` property within a `CollectionConfig` to customize views like the document edit page for a particular collection.

```TypeScript
import type { CollectionConfig } from 'payload'

export const MyCollectionConfig: CollectionConfig = {
  // ...
  admin: {
    components: {
      views: {
        edit: {
```

--------------------------------

### Configure Metadata for a Specific Payload View

Source: https://payloadcms.com/docs/admin/metadata

This example shows how to apply metadata to a specific view within the Payload CMS Admin Panel. The 'meta' key within a view's configuration allows overriding root, collection, or global metadata for that particular view.

```JavaScript
{
// ...
admin: {
views: {
dashboard: {
meta: {
title: 'My Dashboard',
description: 'The best dashboard in the world'
}
}
}
}
}
```

--------------------------------

### Implement Custom Payload CMS Array Field Label Client Component

Source: https://payloadcms.com/docs/fields/array

This example provides a custom client-side React component for the label of a Payload CMS Array Field. It's marked with `'use client'` and renders a `FieldLabel` component, deriving the label text from the `field` prop.

```TypeScript
'use client'
import type { ArrayFieldLabelClientComponent } from 'payload'

import { FieldLabel } from '@payloadcms/ui'
import React from 'react'

export const CustomArrayFieldLabelClient: ArrayFieldLabelClientComponent = ({
  field,
  path,
}) => {
  return (
    <FieldLabel
      label={field?.label || field?.name}
      path={path}
      required={field?.required}
    />
  )
}
```

--------------------------------

### Define External Update Access Function for Payload

Source: https://payloadcms.com/docs/access-control/collections

This example shows how to define a more complex `update` access control function in a separate file and import it. It allows 'admin' users to update any document and other users to update only their own document by comparing `user.id` with the document `id`.

```typescript
import type { Access } from 'payload'

export const canUpdateUser: Access = ({ req: { user }, id }) => {
  // Allow users with a role of 'admin'
  if (user.roles && user.roles.some((role) => role === 'admin')) {
    return true
  }

  // allow any other users to update only oneself
  return user.id === id
}
```

--------------------------------

### Slate Editor Admin Options API Reference

Source: https://payloadcms.com/docs/rich-text/slate

This API documentation outlines the configurable options available under the `admin` property of the `slateEditor` function. It details how to customize allowed elements, leaves, and add custom fields to link and upload elements within the rich text editor's admin interface.

```APIDOC
slateEditor(options: object): EditorConfig
  options:
    admin: object // Configuration for the editor's admin panel behavior.
      elements: Array<string> // Specifies which built-in or custom SlateJS elements should be made available.
        // Default elements include: h1, h2, h3, h4, h5, h6, blockquote, link, ol, ul, li, textAlign, indent, relationship, upload.
      leaves: Array<string> // Specifies built-in or custom SlateJS leaves to be enabled.
        // Default leaves include: bold, code, italic, strikethrough, underline.
      link: object // Configuration for link elements.
        fields: Array<FieldConfig> | Function // Allows adding extra fields to a link.
          // Type: Array<FieldConfig> - all fields appended below default.
          // Type: Function - accepts default fields, returns array defining all fields.
      upload: object // Configuration for upload elements.
        collections: object // Map of collection names to their field configurations.
          [collection-name]: object // Configuration for a specific upload-enabled collection.
            fields: Array<FieldConfig> // Allows saving meta data on an upload field.
```

--------------------------------

### Configure Custom Admin Logo in Payload CMS

Source: https://payloadcms.com/docs/custom-components/root-components

This snippet demonstrates how to configure a custom logo for the Payload CMS admin panel's login view and other contexts. It involves setting the `admin.components.graphics.Logo` property in the Payload configuration to the path of your custom React component, followed by an example of a simple React component for the logo.

```TypeScript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    components: {
      graphics: {
        Logo: '/path/to/your/component',
      },
    },
  },
})
```

```JavaScript
export default function MyCustomLogo() {
  return <img src="/path/to/your/logo.png" alt="My Custom Logo" />
}
```

--------------------------------

### Payload `admin.preview` Function Arguments

Source: https://payloadcms.com/docs/admin/preview

Documentation for the arguments passed to the `admin.preview` function in Payload CMS. It details the `doc` object, which contains the document's data, and the `options` object, which includes `locale`, `req` (Payload Request object), and `token` (JWT token).

```APIDOC
admin.preview(doc: Document, options: object): string | Promise<string>
  doc:
    Description: The data of the Document being edited. This includes changes that have not yet been saved.
  options:
    Description: An object with additional properties.
    Properties:
      locale:
        Description: The current locale of the Document being edited.
      req:
        Description: The Payload Request object.
      token:
        Description: The JWT token of the currently authenticated in user.
```

--------------------------------

### Payload CMS Server Function with Error Handling

Source: https://payloadcms.com/docs/local-api/server-functions

This JavaScript/TypeScript example demonstrates how to implement robust error handling within a Payload CMS server function. It wraps the 'payload.create' operation in a 'try/catch' block to gracefully manage potential errors, logs the error on the server, and returns a user-friendly error message to the frontend.

```javascript
export async function createPost(data) {
  try {
    const payload = await getPayload({ config })
    return await payload.create({ collection: 'posts', data })
  } catch (error) {
    console.error('Error creating post:', error)
    return { error: 'Failed to create post' }
  }
}
```

--------------------------------

### Configure Rich Text Field Admin Options in TypeScript

Source: https://payloadcms.com/docs/fields/rich-text

Example demonstrating how to apply admin-specific configurations to a Rich Text Field within a Payload CMS field definition using TypeScript. This allows customization of the field's appearance and behavior in the Admin Panel by utilizing the `admin` property.

```typescript
import type { Field } from 'payload'

export const MyRichTextField: Field = {
  // ...
  admin: {
    // ...
  },
}
```

--------------------------------

### Cancel multiple Jobs using a 'Where' query in Payload CMS

Source: https://payloadcms.com/docs/jobs-queue/jobs

This example demonstrates how to cancel multiple jobs simultaneously based on specific criteria. The `payload.jobs.cancel` method accepts a `where` query, allowing filtering of jobs by properties like `workflowSlug`. This provides a powerful way to manage batches of jobs.

```TypeScript
await payload.jobs.cancel({
  where: {
    workflowSlug: {
      equals: 'createPost',
    },
  },
})
```

--------------------------------

### Payload CMS: Add New Custom Admin Panel View

Source: https://payloadcms.com/docs/custom-components/custom-views

This example illustrates how to add an entirely new custom view to the Payload CMS Admin Panel. It defines a new key within the `admin.components.views` object, specifying both the custom component path and the URL path for the new view.

```JavaScript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    components: {
      views: {
        myCustomView: {
          Component: '/path/to/MyCustomView#MyCustomViewComponent',
          path: '/my-custom-view'
        }
      }
    }
  }
})
```

--------------------------------

### Create Custom SaveButton React Server Component

Source: https://payloadcms.com/docs/custom-components/edit-view

An example of a custom Save Button implemented as a React Server Component for Payload CMS. It imports the base `SaveButton` from `@payloadcms/ui` and uses `SaveButtonServerProps` for type safety, allowing for custom labels or logic.

```typescript
import React from 'react'
import { SaveButton } from '@payloadcms/ui'
import type { SaveButtonServerProps } from 'payload'

export function MySaveButton(props: SaveButtonServerProps) {
  return <SaveButton label="Save" />
}
```

--------------------------------

### Implement Dynamic Option Filtering for Payload CMS Select Field

Source: https://payloadcms.com/docs/fields/select

This example illustrates how to use the `filterOptions` property to dynamically control which options are available in a Select Field. It demonstrates defining a static list of options and implies how `filterOptions` would be used to restrict or modify this list based on runtime conditions like user roles or other field values, affecting both Admin Panel display and database saving.

```TypeScript
import type { Field } from 'payload'

export const MySelectField: Field = {
  // ...
  type: 'select',
  options: [
    {
      label: 'One',
      value: 'one',
    },
    {
      label: 'Two',
      value: 'two',
    },
    {
      label: 'Three',
      value: 'three',
    },
  ],
}
```

--------------------------------

### Configure Payload CMS Array Field for Image Slider

Source: https://payloadcms.com/docs/fields/array

This example demonstrates how to define an Array Field named `slider` within a Payload CMS collection. It includes nested fields for `title`, `image`, and `caption`, and shows how to set `minRows`, `maxRows`, and `labels` for the array.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'slider', // required
      type: 'array', // required
      label: 'Image Slider',
      minRows: 2,
      maxRows: 10,
      interfaceName: 'CardSlider', // optional
      labels: {
        singular: 'Slide',
        plural: 'Slides',
      },
      fields: [
        // required
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
  ],
}
```

--------------------------------

### Basic Navigation with PayloadCMS Link Component

Source: https://payloadcms.com/docs/admin/react-hooks

Shows a simple usage of the Link component from @payloadcms/ui for navigating between pages. This component automatically handles route transitions.

```tsx
import { Link } from '@payloadcms/ui'\n\nconst MyComponent = () => {\n  return <Link href="/somewhere">Go Somewhere</Link>\n}
```

--------------------------------

### Configure Payload Collection to Omit JWT from Responses

Source: https://payloadcms.com/docs/authentication/jwt

This TypeScript example illustrates how to configure a Payload CMS collection to prevent the JWT from being returned in authentication responses. By setting `removeTokenFromResponses` to `true` within the `auth` configuration of a `CollectionConfig`, the token will not be included in the API response after login or refresh operations.

```TypeScript
import type { CollectionConfig } from 'payload'

export const UsersWithoutJWTs: CollectionConfig = {
  slug: 'users-without-jwts',
  auth: {
    removeTokenFromResponses: true,
  },
}
```

--------------------------------

### Registering a Client Feature within a Server Feature in Payload CMS

Source: https://payloadcms.com/docs/rich-text/custom-features

This example illustrates how to integrate a client-side feature into a server-side feature in Payload CMS. It shows passing the client feature's import path to the `ClientFeature` property within `createServerFeature`, establishing the server feature as the primary entry point.

```typescript
import { createServerFeature } from '@payloadcms/richtext-lexical'

export const MyFeature = createServerFeature({
  feature: {
    ClientFeature: './path/to/feature.client#MyClientFeature'
  },
  key: 'myFeature',
  dependenciesPriority: ['otherFeature']
})
```

--------------------------------

### Payload CMS Stripe Plugin `sync` Feature API Details

Source: https://payloadcms.com/docs/plugins/stripe

This section details the automatic behaviors and integrations provided by the `sync` configuration option within the Payload CMS Stripe plugin. It outlines the fields added, links created, flags maintained, and the various hooks and Stripe webhooks handled by the synchronization process, along with current limitations.

```APIDOC
sync:
  description: Configures automatic synchronization between Payload collections and Stripe resources.
  effects:
    - Adds and maintains a `stripeID` read-only field on each collection (Stripe-generated cross-reference).
    - Adds a direct link to the resource on Stripe.com.
    - Adds and maintains an `skipSync` read-only flag on each collection to prevent infinite syncs when hooks trigger webhooks.
    - Adds the following hooks to each collection:
      - `beforeValidate`: `createNewInStripe`
      - `beforeChange`: `syncExistingWithStripe`
      - `afterDelete`: `deleteFromStripe`
    - Handles the following Stripe webhooks:
      - `STRIPE_TYPE.created`: `handleCreatedOrUpdated`
      - `STRIPE_TYPE.updated`: `handleCreatedOrUpdated`
      - `STRIPE_TYPE.deleted`: `handleDeleted`
  limitations:
    - Currently only works with top-level fields due to Stripe API limitations.
    - Cases requiring deeper abstraction may need hard-coding.
```

--------------------------------

### PayloadCMS Multi-Tenant Plugin Options API

Source: https://payloadcms.com/docs/plugins/multi-tenant

Defines the configurable options for the PayloadCMS multi-tenant plugin, including labels, slugs, access control functions, and feature toggles for tenant and user filtering.

```APIDOC
tenantSelectorLabel?:
| Partial<{
[key in AcceptedLanguages]?: string
}>
| string
/**
* The slug for the tenant collection
*
* @default 'tenants'
*/
tenantsSlug?: string
/**
* Function that determines if a user has access to _all_ tenants
*
* Useful for super-admin type users
*/
userHasAccessToAllTenants?: (
user: ConfigTypes extends { user: unknown } ? ConfigTypes['user'] : User,
) => boolean
/**
* Opt out of adding access constraints to the tenants collection
*/
useTenantsCollectionAccess?: boolean
/**
* Opt out including the baseListFilter to filter tenants by selected tenant
*/
useTenantsListFilter?: boolean
/**
* Opt out including the baseListFilter to filter users by selected tenant
*/
useUsersTenantFilter?: boolean
}
```

--------------------------------

### Customizing Payload Blocks Field Row Labels

Source: https://payloadcms.com/docs/fields/blocks

This example shows how to create a custom row label for individual blocks within a Payload CMS Blocks field. It utilizes the `useRowLabel` hook to access block data and row number, allowing for dynamic and informative labels.

```typescript
'use client'

import { useRowLabel } from '@payloadcms/ui'

export const BlockRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()

  const customLabel = `${data.type} ${String(rowNumber).padStart(2, '0')} `

  return <div>Custom Label: {customLabel}</div>
}
```

--------------------------------

### Configure Payload CMS JSON Field with Remote Schema

Source: https://payloadcms.com/docs/fields/json

This example shows how to configure a Payload CMS `json` field to validate against a remote JSON schema. The `jsonSchema` property specifies the `uri` and `fileMatch` for the external schema file, allowing Payload to fetch and apply validation rules defined externally.

```typescript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'customerJSON', // required
      type: 'json', // required
      jsonSchema: {
        uri: 'https://example.com/customer.schema.json', // required
        fileMatch: ['https://example.com/customer.schema.json'], // required
      },
    },
  ],
}
```

--------------------------------

### Extract Editor Config from Instantiated Lexical Editor

Source: https://payloadcms.com/docs/rich-text/converters

While less efficient and generally not recommended, you can extract the editor configuration from an already instantiated Lexical editor instance using the `fromEditor` method. It's preferable to use `fromFeatures` by extracting features into a separate variable for better performance.

```TypeScript
const editor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
  ],
})

const instantiatedEditorConfig = await editorConfigFactory.fromEditor({
  config,
  editor,
})
```

--------------------------------

### PayloadCMS `beforeLogin` Hook Arguments Reference

Source: https://payloadcms.com/docs/hooks/collections

Detailed reference for arguments available within the `beforeLogin` hook, including collection context, custom context, request object, and the user being logged in.

```APIDOC
collection: The Collection in which this Hook is running against.
context: Custom context passed between hooks.
req: The Web Request object. Mocked for Local API operations.
user: The user being logged in.
```

--------------------------------

### Custom Server Component for Payload CMS Code Field Label

Source: https://payloadcms.com/docs/fields/code

This example illustrates how to define a custom server-side component for the Payload CMS Code Field label. It uses `FieldLabel` from `@payloadcms/ui` to display the label, path, and required status of the field, providing flexibility in rendering field labels on the server.

```typescript
import React from 'react'
import { FieldLabel } from '@payloadcms/ui'
import type { CodeFieldLabelServerComponent } from 'payload'

export const CustomCodeFieldLabelServer: CodeFieldLabelServerComponent = ({
  clientField,
  path,
}) => {
  return (
    <FieldLabel
      label={clientField?.label || clientField?.name}
      path={path}
      required={clientField?.required}
    />
  )
}
```

--------------------------------

### Payload Admin Root Metadata Configuration Options

Source: https://payloadcms.com/docs/admin/metadata

Detailed API documentation for the configurable options within the `admin.meta` key for root-level metadata in Payload. Includes types and descriptions for each property.

```APIDOC
Root Metadata Options:
  defaultOGImageType: dynamic (default) | static | off
    Description: The type of default OG image to use. If set to dynamic, Payload will use Next.js image generation to create an image with the title of the page. If set to static, Payload will use the defaultOGImage URL. If set to off, Payload will not generate an OG image.
  titleSuffix: string
    Description: A suffix to append to the end of the title of every page. Defaults to "- Payload".
  [keyof Metadata]: unknown
    Description: Any other properties that Next.js supports within the generateMetadata function. More details: https://nextjs.org/docs/app/api-reference/functions/generate-metadata.
```

--------------------------------

### Customize Forgot Password Email HTML in Payload

Source: https://payloadcms.com/docs/authentication/email

This example demonstrates how to use the `generateEmailHTML` function within the `auth.forgotPassword` configuration to provide a custom HTML template for password reset emails. It includes `req`, `token`, and `user` to generate a dynamic reset URL and a full HTML email body.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  // ...
  auth: {
    forgotPassword: {
      generateEmailHTML: ({ req, token, user }) => {
        // Use the token provided to allow your user to reset their password
        const resetPasswordURL = `https://yourfrontend.com/reset-password?token=${token}`

        return `
<!doctype html>
<html>
<body>
<h1>Here is my custom email template!</h1>
<p>Hello, ${user.email}!</p>
<p>Click below to reset your password.</p>
<p>
<a href="${resetPasswordURL}">${resetPasswordURL}</a>
</p>
</body>
</html>
`
      },
    },
  },
}
```

--------------------------------

### Configure Custom Admin Logout Button in Payload CMS

Source: https://payloadcms.com/docs/custom-components/root-components

This snippet illustrates how to replace the default logout button in the Payload CMS admin sidebar with a custom React component. The `admin.components.logout.Button` property in the Payload configuration should point to your custom component, followed by an example of a simple React component for the logout button.

```TypeScript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    components: {
      logout: {
        Button: '/path/to/your/component',
      },
    },
  },
})
```

```JavaScript
export default function MyCustomLogoutButton() {
  return <button onClick={() => alert('Logging out!')}>Log Out</button>
}
```

--------------------------------

### Payload CMS: Reusing Default Field Validations

Source: https://payloadcms.com/docs/fields/overview

Shows how to augment Payload CMS's default field validation logic with custom rules. This example applies a specific custom check (disallowing 'bad' as a value) and then calls the `text` default validator from `payload/shared` to ensure both custom and standard validations are applied.

```typescript
import { text } from 'payload/shared'

const field: Field = {
  name: 'notBad',
  type: 'text',
  validate: (val, args) => {
    if (val === 'bad') return 'This cannot be "bad"'
    return text(val, args)
  },
}
```

--------------------------------

### Preventing Infinite Loops in Payload CMS afterChange Hook (Bad Example)

Source: https://payloadcms.com/docs/hooks/context

This snippet illustrates a common anti-pattern where an `afterChange` hook directly updates the same document that triggered it without any control mechanism. This inevitably leads to an infinite loop, as each update re-triggers the hook, causing continuous execution.

```typescript
import type { CollectionConfig } from 'payload'

const Customer: CollectionConfig = {
  slug: 'customers',
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await req.payload.update({
          // DANGER: updating the same slug as the collection in an afterChange will create an infinite loop!
          collection: 'customers',
          id: doc.id,
          data: {
            ...(await fetchCustomerData(data.customerID)),
          },
        })
      },
    ],
  },
  fields: [
    /* ... */
  ],
}
```

--------------------------------

### Payload CMS `AllowItem` Properties API Reference

Source: https://payloadcms.com/docs/upload/overview

This API documentation details the properties available within an `AllowItem` object, which is used in the `pasteURL` `allowList` for defining trusted domains. It specifies required fields like `hostname` and optional path parameters, including wildcard support for `pathname`.

```APIDOC
AllowItem Properties:
  hostname*: The hostname of the allowed URL. This is required to ensure the URL is coming from a trusted source. Example: `example.com`
  pathname: The path portion of the URL. Supports wildcards to match multiple paths. Example: `/images/*`
```

--------------------------------

### Configure Form Builder Plugin Redirect Relationships

Source: https://payloadcms.com/docs/plugins/form-builder

Example of configuring the `redirectRelationships` option for the Payload Form Builder plugin. This array specifies collection slugs whose documents can be populated as options for the form's `redirect` field, allowing users to be sent to a dedicated confirmation page upon form submission.

```TypeScript
// payload.config.ts
formBuilderPlugin({
  // ...
  redirectRelationships: ['pages'],
})
```

--------------------------------

### Payload GraphQL Queries for Collections

Source: https://payloadcms.com/docs/graphql/overview

Table listing the automatically generated GraphQL queries available for a Payload Collection, including `findByID`, `find`, `count`, and `me` operations.

```APIDOC
Query Name | Operation
--- | ---
`PublicUser` | `findByID`
`PublicUsers` | `find`
`countPublicUsers` | `count`
`mePublicUser` | `me` auth operation
```

--------------------------------

### Fresh Payload CMS Database Migration

Source: https://payloadcms.com/docs/database/migrations

The `migrate:fresh` command drops all entities from the database and then re-runs all migrations from the beginning, providing a clean slate.

```Shell
npm run payload migrate:fresh
```

--------------------------------

### Override Forms Collection Configuration in PayloadCMS Form Builder

Source: https://payloadcms.com/docs/plugins/form-builder

Illustrates how to customize the `forms` collection within the PayloadCMS Form Builder plugin using `formOverrides`. This example modifies the slug, sets read access for authenticated users only, and adds a custom field while preserving default fields.

```TypeScript
// payload.config.ts
formBuilderPlugin({
// ...
formOverrides: {
slug: 'contact-forms',
access: {
read: ({ req: { user } }) => !!user, // authenticated users only
update: () => false,
},
fields: ({ defaultFields }) => {
return [
...defaultFields,
{
name: 'custom',
type: 'text',
},
]
},
},
})
```

--------------------------------

### Define Payload CMS JSON Field with Local Schema

Source: https://payloadcms.com/docs/fields/json

This snippet demonstrates how to define a `json` field in Payload CMS with an inline, local JSON schema. The `jsonSchema` property includes `uri`, `fileMatch`, and the `schema` object itself, which defines validation rules for the JSON data. This example restricts the 'foo' property to 'bar' or 'foobar'.

```typescript
fields: [

6

{

7

name: 'customerJSON', // required

8

type: 'json', // required

9

jsonSchema: {

10

uri: 'a://b/foo.json', // required

11

fileMatch: ['a://b/foo.json'], // required

12

schema: {

13

type: 'object',

14

properties: {

15

foo: {

16

enum: ['bar', 'foobar'],

17

},

18

},

19

},

20

},

21

},

22

],
```

--------------------------------

### Payload `useLivePreview` Hook Return Values API

Source: https://payloadcms.com/docs/live-preview/client

Documents the values returned by the `useLivePreview` hook provided by Payload CMS. It describes the `data` property, which contains the live document data merged with initial data, and `isLoading`, a boolean indicating the current loading state of the document.

```APIDOC
useLivePreview():
  data: any - The live data of the document, merged with the initial data.
  isLoading: boolean - A boolean that indicates whether or not the document is loading.
```

--------------------------------

### Automate Markdown Output in Payload Collection Hooks

Source: https://payloadcms.com/docs/rich-text/converting-markdown

This example illustrates how to automatically generate and store Markdown from a rich text field within a Payload collection using `afterRead` and `beforeChange` hooks. The `afterRead` hook converts the Lexical editor state to Markdown, making it available as a sibling field, while the `beforeChange` hook ensures the generated Markdown is not persisted to the database.

```typescript
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { CollectionConfig, RichTextField } from 'payload'

import {
  convertLexicalToMarkdown,
  editorConfigFactory,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    {
      name: 'nameOfYourRichTextField',
      type: 'richText',
      editor: lexicalEditor(),
    },
    {
      name: 'markdown',
      type: 'textarea',
      admin: {
        hidden: true,
      },
      hooks: {
        afterRead: [
          ({ siblingData, siblingFields }) => {
            const data: SerializedEditorState =
              siblingData['nameOfYourRichTextField']

            if (!data) {
              return ''
            }

            const markdown = convertLexicalToMarkdown({
              data,
              editorConfig: editorConfigFactory.fromField({
                field: siblingFields.find(
                  (field) =>
                    'name' in field && field.name === 'nameOfYourRichTextField',
                ) as RichTextField,
              }),
            })

            return markdown
          },
        ],
        beforeChange: [
          ({ siblingData }) => {
            // Ensure that the markdown field is not saved in the database
            delete siblingData['markdown']
            return null
          },
        ],
      },
    },
  ],
}
```

--------------------------------

### Example Drizzle Schema Generated from Database Introspection

Source: https://payloadcms.com/docs/database/sqlite

This code block illustrates a typical Drizzle schema file (`schema.ts`) that might be generated by Drizzle Introspection from an existing database. It defines two tables, `users` and `countries`, complete with columns, primary keys, and unique indexes, ready for integration into a Payload CMS project.

```typescript
import {
  sqliteTable,
  text,
  uniqueIndex,
  integer
} from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fullName: text('full_name'),
  phone: text('phone', { length: 256 })
})

export const countries = sqliteTable(
  'countries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name', { length: 256 })
  },
  (countries) => {
    return {
      nameIndex: uniqueIndex('name_idx').on(countries.name)
    }
  }
)
```

--------------------------------

### Configure Conditional Field Display in Payload CMS

Source: https://payloadcms.com/docs/fields/overview

This example demonstrates how to use the `condition` function within a field's `admin` configuration to dynamically show or hide a field based on the value of another sibling field. It utilizes `data` to access the current document's values and `siblingData` for direct sibling field values.

```JavaScript
{
  fields: [
    {
      name: 'enableGreeting',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'greeting',
      type: 'text',
      admin: {
        condition: (data, siblingData, { blockData, path, user }) => {
          if (data.enableGreeting) {
            return true
          } else {
            return false
          }
        },
      },
    },
  ]
}
```

--------------------------------

### Retrieve Localized Documents via Payload CMS REST API

Source: https://payloadcms.com/docs/configuration/localization

This section details how to use URL query parameters to specify locale and fallback locale when fetching documents via the Payload CMS REST API. The `?locale=` parameter sets the desired language, while `?fallback-locale=` allows specifying a fallback locale or disabling fallback entirely using 'null', 'false', or 'none'. The example demonstrates a `fetch` call with both parameters.

```APIDOC
`?locale=`
Specify your desired locale by providing the `locale` query parameter directly in the endpoint URL.

`?fallback-locale=`
Specify fallback locale to be used by providing the `fallback-locale` query parameter. This can be provided as either a valid locale as provided to your base Payload Config, or `'null'`, `'false'`, or `'none'` to disable falling back.
```

```JavaScript
fetch('https://localhost:3000/api/pages?locale=es&fallback-locale=none');
```

--------------------------------

### Translate Collection Labels and Field Properties in Payload CMS

Source: https://payloadcms.com/docs/configuration/i18n

This example demonstrates how to apply internationalization to project-specific elements within a Payload CMS `CollectionConfig`, such as collection labels (singular/plural) and field properties (label, placeholder). Translations are provided as an object keyed by language codes, allowing for multi-language display of UI elements and content fields.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: {
      en: 'Article',
      es: 'Artículo',
    },
    plural: {
      en: 'Articles',
      es: 'Artículos',
    },
  },
  admin: {
    group: {
      en: 'Content',
      es: 'Contenido',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        es: 'Título',
      },
      admin: {
        placeholder: {
          en: 'Enter title',
          es: 'Introduce el título',
        },
      },
    },
  ],
}
```

--------------------------------

### PayloadCMS: Dynamically Filter Query Preset Constraints Based on User Roles

Source: https://payloadcms.com/docs/query-presets/overview

This TypeScript example illustrates how to use the `filterConstraints` property within PayloadCMS's `queryPresets` configuration to dynamically control the visibility of constraint options. The provided function checks if the requesting user is an 'admin'. If not, it filters out the 'everyone' option, preventing non-admin users from making presets universally available. This enhances security by enforcing permission-based access to certain constraint settings.

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  queryPresets: {
    // ...
    filterConstraints: ({ req, options }) =>
      !req.user?.roles?.includes('admin')
        ? options.filter(
            (option) =>
              (typeof option === 'string' ? option : option.value) !==
              'everyone',
          )
        : options,
  },
})
```

--------------------------------

### Payload CMS Local API Query with Join Field Options

Source: https://payloadcms.com/docs/fields/join

Demonstrates how to use the `joins` option within the Payload Local API `payload.find` method to apply custom filters, limits, and sorting to related documents retrieved via a Join Field. This example filters categories and then applies specific query options to the `relatedPosts` join field.

```JavaScript
const result = await payload.find({
  collection: 'categories',
  where: {
    title: {
      equals: 'My Category',
    },
  },
  joins: {
    relatedPosts: {
      limit: 5,
      where: {
        title: {
          equals: 'My Post',
        },
      },
      sort: 'title',
    },
  },
})
```

--------------------------------

### Configure Payload CMS Upload Field with `filterOptions` for Image Mime Type

Source: https://payloadcms.com/docs/fields/upload

This JavaScript example demonstrates how to define an `upload` field named 'image' in Payload CMS. It configures the `relationTo` property to 'media' and uses `filterOptions` with a `Where` query to ensure that only documents with a `mimeType` containing 'image' can be selected, effectively filtering for image files.

```JavaScript
const uploadField = {
  name: 'image',
  type: 'upload',
  relationTo: 'media',
  filterOptions: {
    mimeType: { contains: 'image' },
  },
}
```

--------------------------------

### Define External Delete Access Function with Query for Payload

Source: https://payloadcms.com/docs/access-control/collections

This example shows a more advanced `delete` access control function defined externally. It allows deletion if no `id` is provided (for UI controls) or if there are no related 'contracts' documents for the given customer `id`, preventing deletion of customers with active contracts.

```typescript
import type { Access } from 'payload'

export const canDeleteCustomer: Access = async ({ req, id }) => {
  if (!id) {
    // allow the admin UI to show controls to delete since it is indeterminate without the `id`
    return true
  }

  // Query another Collection using the `id`
  const result = await req.payload.find({
    collection: 'contracts',
    limit: 0,
    depth: 0,
    where: {
      customer: { equals: id }
    }
  })

  return result.totalDocs === 0
}
```

--------------------------------

### Configure Payload Migration Script in package.json

Source: https://payloadcms.com/docs/database/migrations

This snippet demonstrates how to add a 'payload' script to your project's `package.json` file. This script is essential for executing Payload's migration commands, using `cross-env` to set the configuration path.

```JSON
{
  "scripts": {
    "payload": "cross-env PAYLOAD_CONFIG_PATH=src/payload.config.ts payload"
  }
}
```

--------------------------------

### Overriding Default Text Field Configuration in PayloadCMS Form Builder

Source: https://payloadcms.com/docs/plugins/form-builder

This example illustrates how to customize an existing field, specifically the 'text' field, within the PayloadCMS form builder plugin. By spreading the original `fields.text` and modifying properties like `labels`, developers can alter default behaviors or appearances.

```typescript
// payload.config.ts
formBuilderPlugin({
  // ...
  fields: {
    text: {
      ...fields.text,
      labels: {
        singular: 'Custom Text Field',
        plural: 'Custom Text Fields'
      }
    }
  }
})
```

--------------------------------

### Define Custom Buttons Toolbar Group for Payload CMS Lexical Editor

Source: https://payloadcms.com/docs/rich-text/custom-features

This TypeScript example demonstrates how to create a custom 'buttons' type toolbar group for the Payload CMS Lexical rich text editor. It defines a function that accepts an array of toolbar items and returns a `ToolbarGroup` object, specifying its type, key, and order.

```TypeScript
import type {
  ToolbarGroup,
  ToolbarGroupItem,
} from '@payloadcms/richtext-lexical'

export const toolbarFormatGroupWithItems = (
  items: ToolbarGroupItem[],
): ToolbarGroup => {
  return {
    type: 'buttons',
    items,
    key: 'myButtonsToolbar',
    order: 10,
  }
}
```

--------------------------------

### Implement Custom Save Draft Button (Server Component)

Source: https://payloadcms.com/docs/custom-components/edit-view

This example shows a custom 'Save Draft' button implemented as a server-side React component for PayloadCMS. It imports the default `SaveDraftButton` from `@payloadcms/ui` and renders it, allowing for server-side logic or data fetching before the component is sent to the client.

```tsx
import React from 'react'
import { SaveDraftButton } from '@payloadcms/ui'
import type { SaveDraftButtonServerProps } from 'payload'

export function MySaveDraftButton(props: SaveDraftButtonServerProps) {
  return <SaveDraftButton />
}
```

--------------------------------

### Payload CMS: Handle Draft Access for Existing Collections with Missing Status

Source: https://payloadcms.com/docs/versions/drafts

This TypeScript example extends Payload CMS access control for collections that existed before draft functionality was enabled. It allows unauthenticated users to read documents where `_status` is 'published' OR where `_status` does not exist, providing backward compatibility for older content that might not have the `_status` field.

```typescript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: ({ req }) => {
      // If there is a user logged in,
      // let them retrieve all documents
      if (req.user) return true

      // If there is no user,
      // restrict the documents that are returned
      // to only those where `_status` is equal to `published`
      // or where `_status` does not exist
      return {
        or: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            _status: {
              exists: false,
            },
          },
        ],
      }
    },
  },
  versions: {
    drafts: true,
  },
  //.. the rest of the Pages config here
}
```

--------------------------------

### Retrieve Localized Documents via Payload CMS Local API

Source: https://payloadcms.com/docs/configuration/localization

This section describes how to specify locale and fallback locale when using the Payload CMS Local API. Both `locale` and `fallbackLocale` can be passed as properties within the `options` argument of methods like `payload.find()`. The `locale` property accepts any valid locale, while `fallbackLocale` accepts valid locales or boolean/string values like `'null'`, `'false'`, `false`, and `'none'` to control fallback behavior. The example shows fetching 'posts' with specific locale and fallback settings.

```APIDOC
You can specify `locale` as well as `fallbackLocale` within the Local API as well as properties on the `options` argument. The `locale` property will accept any valid locale, and the `fallbackLocale` property will accept any valid locale as well as `'null'`, `'false'`, `false`, and `'none'`.
```

```JavaScript
const posts = await payload.find({
  collection: 'posts',
  locale: 'es',
  fallbackLocale: false,
})
```

--------------------------------

### Create Custom SaveButton React Client Component

Source: https://payloadcms.com/docs/custom-components/edit-view

An example of a custom Save Button implemented as a React Client Component for Payload CMS. It uses the `'use client'` directive, imports the base `SaveButton` from `@payloadcms/ui`, and uses `SaveButtonClientProps` for type safety, suitable for interactive client-side logic.

```typescript
'use client'
import React from 'react'
import { SaveButton } from '@payloadcms/ui'
import type { SaveButtonClientProps } from 'payload'

export function MySaveButton(props: SaveButtonClientProps) {
  return <SaveButton label="Save" />
}
```

--------------------------------

### Payload GraphQL Mutations for Collections

Source: https://payloadcms.com/docs/graphql/overview

Table listing the automatically generated GraphQL mutations available for a Payload Collection, including `create`, `update`, `delete`, and various authentication-related operations like `forgotPassword`, `login`, and `logout`.

```APIDOC
Query Name | Operation
--- | ---
`createPublicUser` | `create`
`updatePublicUser` | `update`
`deletePublicUser` | `delete`
`forgotPasswordPublicUser` | `forgotPassword` auth operation
`resetPasswordPublicUser` | `resetPassword` auth operation
`unlockPublicUser` | `unlock` auth operation
`verifyPublicUser` | `verify` auth operation
`loginPublicUser` | `login` auth operation
`logoutPublicUser` | `logout` auth operation
`refreshTokenPublicUser` | `refresh` auth operation
```

--------------------------------

### Configure Multiple Field Hook Types in Payload CMS

Source: https://payloadcms.com/docs/hooks/fields

This example demonstrates how to specify multiple types of field hooks within a Payload CMS field configuration. It shows common hook types like `beforeValidate`, `beforeChange`, `beforeDuplicate`, `afterChange`, and `afterRead`, each accepting an array of functions to execute custom logic at different stages of the document lifecycle.

```typescript
import type { Field } from 'payload';

const FieldWithHooks: Field = {
  name: 'name',
  type: 'text',
  hooks: {
    beforeValidate: [(args) => {...}],
    beforeChange: [(args) => {...}],
    beforeDuplicate: [(args) => {...}],
    afterChange: [(args) => {...}],
    afterRead: [(args) => {...}],
  }
}
```

--------------------------------

### Query Nested Properties in Payload CMS (TypeScript)

Source: https://payloadcms.com/docs/queries/overview

This snippet demonstrates how to query fields within nested properties or relational fields in Payload CMS using dot notation. It shows how to filter a 'Song' collection based on a property ('featured') within its related 'Artists' collection, for example, checking if 'artists.featured' exists.

```TypeScript
import type { Where } from 'payload'

const query: Where = {
  'artists.featured': {
    exists: true,
  },
}
```

--------------------------------

### Payload CMS Local API: Global Operations API Reference

Source: https://payloadcms.com/docs/local-api/overview

Detailed API reference for global document operations available through the Payload Local API, including `findGlobal` and `updateGlobal` methods with their respective parameters, types, and descriptions.

```APIDOC
Globals:
  Methods:
    findGlobal:
      Description: Retrieves a global document.
      Signature: payload.findGlobal(options: object): Promise<GlobalDocument>
      Parameters:
        slug:
          Type: string
          Required: true
          Description: The unique identifier of the global.
        depth:
          Type: number
          Required: false
          Description: Depth of relations to populate.
        locale:
          Type: string
          Required: false
          Description: Locale to fetch data in.
        fallbackLocale:
          Type: boolean
          Required: false
          Description: Whether to fallback to default locale if data is not found in specified locale.
        user:
          Type: UserObject
          Required: false
          Description: User object for access control.
        overrideAccess:
          Type: boolean
          Required: false
          Description: Whether to bypass access control.
        showHiddenFields:
          Type: boolean
          Required: false
          Description: Whether to include hidden fields in the result.
      Returns:
        Type: Promise<GlobalDocument>
        Description: The retrieved global document.

    updateGlobal:
      Description: Updates an existing global document.
      Signature: payload.updateGlobal(options: object): Promise<GlobalDocument>
      Parameters:
        slug:
          Type: string
          Required: true
          Description: The unique identifier of the global to update.
        data:
          Type: object
          Required: true
          Description: The data to update the global with.
        depth:
          Type: number
          Required: false
          Description: Depth of relations to populate.
        locale:
          Type: string
          Required: false
          Description: Locale to fetch data in.
        fallbackLocale:
          Type: boolean
          Required: false
          Description: Whether to fallback to default locale if data is not found in specified locale.
        user:
          Type: UserObject
          Required: false
          Description: User object for access control.
        overrideAccess:
          Type: boolean
          Required: false
          Description: Whether to bypass access control.
        overrideLock:
          Type: boolean
          Required: false
          Default: true
          Description: Whether to ignore document locks. Set to false to enforce locks.
        showHiddenFields:
          Type: boolean
          Required: false
          Description: Whether to include hidden fields in the result.
      Returns:
        Type: Promise<GlobalDocument>
        Description: The updated global document.
```

--------------------------------

### Secure a Custom Payload CMS Admin View by Checking User Login

Source: https://payloadcms.com/docs/custom-components/custom-views

This example shows how to add basic security to a custom Payload CMS admin view by checking if a user is logged in. It accesses the `user` object from `initPageResult.req` and renders a message if no user is found, preventing unauthorized access to the view content.

```TypeScript
import type { AdminViewServerProps } from 'payload'

import { Gutter } from '@payloadcms/ui'
import React from 'react'

export function MyCustomView({ initPageResult }: AdminViewServerProps) {
  const {
    req: { user },
  } = initPageResult

  if (!user) {
    return <p>You must be logged in to view this page.</p>
  }

  return (
    <Gutter>
      <h1>Custom Default Root View</h1>
      <p>This view uses the Default Template.</p>
    </Gutter>
  )
}
```

--------------------------------

### Add Multiple Supported Languages to Payload CMS I18n

Source: https://payloadcms.com/docs/configuration/i18n

This example demonstrates how to import and configure multiple supported languages (English and German) for your Payload CMS application. By listing languages under `supportedLanguages`, you enable the system to detect and serve content in these locales, while also helping to optimize bundle size by only including necessary language files.

```TypeScript
import { buildConfig } from 'payload'
import { en } from '@payloadcms/translations/languages/en'
import { de } from '@payloadcms/translations/languages/de'

export default buildConfig({
  // ...
  i18n: {
    supportedLanguages: { en, de },
  },
})
```

--------------------------------

### Implement Custom Save Draft Button (Client Component)

Source: https://payloadcms.com/docs/custom-components/edit-view

This example shows a custom 'Save Draft' button implemented as a client-side React component for PayloadCMS. It imports the default `SaveDraftButton` from `@payloadcms/ui`, enabling client-side interactions, state management, or additional styling that requires browser execution.

```tsx
'use client'
import React from 'react'
import { SaveDraftButton } from '@payloadcms/ui'
import type { SaveDraftButtonClientProps } from 'payload'

export function MySaveDraftButton(props: SaveDraftButtonClientProps) {
  return <SaveDraftButton />
}
```

--------------------------------

### Create Custom Lexical Editor Config with Features

Source: https://payloadcms.com/docs/rich-text/converters

To create a custom editor configuration, use the `fromFeatures` method. This allows you to extend the `defaultFeatures` with additional features, such as `FixedToolbarFeature`, providing a tailored editor experience.

```TypeScript
import { FixedToolbarFeature } from '@payloadcms/richtext-lexical'

const customEditorConfig = await editorConfigFactory.fromFeatures({
  config,
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
  ],
})
```

--------------------------------

### Configure Payload with MongoDB Mongoose Adapter

Source: https://payloadcms.com/docs/database/mongodb

This snippet demonstrates how to integrate the `@payloadcms/db-mongodb` package into your Payload configuration. It shows how to import the `mongooseAdapter` and pass it to the `db` property of your `buildConfig` function, specifying the database URL from environment variables.

```TypeScript
import { mongooseAdapter } from '@payloadcms/db-mongodb'

export default buildConfig({
  // Your config goes here
  collections: [
    // Collections go here
  ],
  // Configure the Mongoose adapter here
  db: mongooseAdapter({
    // Mongoose-specific arguments go here.
    // URL is required.
    url: process.env.DATABASE_URI,
  }),
})
```

--------------------------------

### Customizing Plaintext Conversion with Node Converters

Source: https://payloadcms.com/docs/rich-text/converting-plaintext

This example illustrates how to provide custom conversion logic for specific Lexical node types when transforming rich text to plaintext. By defining a `converters` object, developers can control how `blocks` (e.g., `textBlock`) and `link` nodes are represented in the final plaintext output, allowing for more precise and context-aware conversions. It highlights the use of `PlaintextConverters` type for type safety.

```TypeScript
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { MyTextBlock } from '@/payload-types'

import {
  convertLexicalToPlaintext,
  type PlaintextConverters,
} from '@payloadcms/richtext-lexical/plaintext'

// Your richtext data here
const data: SerializedEditorState = {}

const converters: PlaintextConverters<
  DefaultNodeTypes | SerializedBlockNode<MyTextBlock>
> = {
  blocks: {
    textBlock: ({ node }) => {
      return node.fields.text ?? ''
    },
  },
  link: ({ node }) => {
    return node.fields.url ?? ''
  },
}

const plaintext = convertLexicalToPlaintext({
  converters,
  data,
})
```

--------------------------------

### Payload CMS: Auto-Login Configuration Options Reference

Source: https://payloadcms.com/docs/authentication/overview

This API documentation outlines the available options for configuring the `autoLogin` property within the Payload CMS admin settings. It details parameters such as `username`, `email`, `password`, and `prefillOnly`, explaining their purpose and usage.

```APIDOC
autoLogin: object | boolean
  Description: Configures automatic login behavior for the admin panel.
  Properties (if object):
    username: string
      Description: The username of the user to login as.
    email: string
      Description: The email address of the user to login as.
    password: string
      Description: The password of the user to login as. This is only needed if `prefillOnly` is set to true.
    prefillOnly: boolean
      Description: If set to true, the login credentials will be prefilled but the user will still need to click the login button.
```

--------------------------------

### Integrate Custom Toolbar Item into Payload CMS Client Feature

Source: https://payloadcms.com/docs/rich-text/custom-features

This TypeScript example shows how to integrate a custom toolbar item into a Payload CMS client feature's fixed toolbar. It uses `createClientFeature` to define a toolbar group with a custom item, including logic for `isActive` state, `label` internationalization, and `onSelect` command dispatch.

```TypeScript
'use client'

import {
  createClientFeature,
  toolbarAddDropdownGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import { IconComponent } from './icon'
import { $isHorizontalRuleNode } from './nodes/MyNode'
import { INSERT_MYNODE_COMMAND } from './plugin'
import { $isNodeSelection } from '@payloadcms/richtext-lexical/lexical'

export const MyClientFeature = createClientFeature({
  toolbarFixed: {
    groups: [
      toolbarAddDropdownGroupWithItems([
        {
          ChildComponent: IconComponent,
          isActive: ({ selection }) => {
            if (!$isNodeSelection(selection) || !selection.getNodes().length) {
              return false
            }

            const firstNode = selection.getNodes()[0]
            return $isHorizontalRuleNode(firstNode)
          },
          key: 'myNode',
          label: ({ i18n }) => {
            return i18n.t('lexical:myFeature:label')
          },
          onSelect: ({ editor }) => {
            editor.dispatchCommand(INSERT_MYNODE_COMMAND, undefined)
          },
        },
      ]),
    ],
  },
})
```

--------------------------------

### Using Transactions in Payload Hooks

Source: https://payloadcms.com/docs/database/transactions

This example demonstrates how to ensure that database operations performed within a Payload `afterChange` hook participate in the main request's transaction. By passing the `req` object, which contains `req.transactionID`, any changes made via `req.payload.create` will only be persisted if the entire request successfully commits its transaction, ensuring atomicity and data consistency.

```typescript
const afterChange: CollectionAfterChangeHook = async ({ req }) => {
  // because req.transactionID is assigned from Payload and passed through,
  // my-slug will only persist if the entire request is successful
  await req.payload.create({
    req,
    collection: 'my-slug',
    data: {
      some: 'data',
    },
  })
}
```

--------------------------------

### Payload CMS Select Field Configuration Options Reference

Source: https://payloadcms.com/docs/fields/select

This section provides a comprehensive reference for all available configuration options for the Payload CMS Select Field. It details each property's purpose, whether it's required, and its impact on the field's behavior, validation, and display within the Admin Panel, including notes on GraphQL naming constraints.

```APIDOC
Select Field Config Options:
- name (required): To be used as the property name when stored and retrieved from the database. [More: ../fields/overview#field-names]
- options (required): Array of options to allow the field to store. Can either be an array of strings, or an array of objects containing a `label` string and a `value` string. (Important: Option values should be strings that do not contain hyphens or special characters due to GraphQL enumeration naming constraints. Underscores are allowed.)
- hasMany: Boolean when, if set to `true`, allows this field to have many selections instead of only one.
- label: Text used as a field label in the Admin Panel or an object with keys for each language.
- unique: Enforce that each entry in the Collection has a unique value for this field.
- validate: Provide a custom validation function that will be executed on both the Admin Panel and the backend. [More: ../fields/overview#validation]
- index: Build an index for this field to produce faster queries. Set this field to `true` if your users will perform queries on this field's data often. [More: ../database/overview]
- saveToJWT: If this field is top-level and nested in a config supporting Authentication, include its data in the user JWT. [More: ../authentication/overview]
- hooks: Provide Field Hooks to control logic for this field. [More: ../hooks/fields]
- access: Provide Field Access Control to denote what users can see and do with this field's data. [More: ../access-control/fields]
- hidden: Restrict this field's visibility from all APIs entirely. Will still be saved to the database, but will not appear in any API or the Admin Panel.
- defaultValue: Provide data to be used for this field's default value. [More: ../fields/overview#default-values]
- localized: Enable localization for this field. Requires localization to be enabled in the Base config. [More: ../configuration/localization]
- required: Require this field to have a value.
- admin: Admin-specific configuration. [More: ../fields/overview#admin-options]
- custom: Extension point for adding custom data (e.g. for plugins).
- enumName: Custom enum name for this field when using SQL Database Adapter (Postgres). Auto-generated from name if not defined. [More: Postgres]
- dbName: Custom table name (if `hasMany` set to `true`) for this field when using SQL Database Adapter (Postgres). Auto-generated from name if not defined. [More: Postgres]
- interfaceName: Create a top level, reusable Typescript interface & GraphQL type. [More: ../typescript/generating-types#custom-field-interfaces, ../graphql/graphql-schema#custom-field-schemas]
- filterOptions: Dynamically filter which options are available based on the user, data, etc. [More: #filterOptions]
- typescriptSchema: Override field type generation with providing a JSON schema.
- virtual: Provide `true` to disable field in the database, or provide a string path to link the field with a relationship. [More: ../fields/relationship#linking-virtual-fields-with-relationships, /blog/learn-how-virtual-fields-can-help-solve-common-cms-challenges]
```

--------------------------------

### Passing Data Between Payload CMS Hooks Using Context

Source: https://payloadcms.com/docs/hooks/context

This example demonstrates how to leverage the `context` object to share data between `beforeChange` and `afterChange` hooks within a Payload CMS collection. Data fetched in an earlier `beforeChange` hook (e.g., `customerData`) is stored in `context` and then seamlessly reused in a subsequent `afterChange` hook, eliminating the need for redundant data fetching.

```typescript
import type { CollectionConfig } from 'payload'

const Customer: CollectionConfig = {
  slug: 'customers',
  hooks: {
    beforeChange: [
      async ({ context, data }) => {
        // assign the customerData to context for use later
        context.customerData = await fetchCustomerData(data.customerID)
        return {
          ...data,
          // some data we use here
          name: context.customerData.name,
        }
      },
    ],
    afterChange: [
      async ({ context, doc, req }) => {
        // use context.customerData without needing to fetch it again
        if (context.customerData.contacted === false) {
          createTodo('Call Customer', context.customerData)
        }
      },
    ],
  },
  fields: [
    /* ... */
  ],
}
```

--------------------------------

### PayloadCMS Local API Operation Options

Source: https://payloadcms.com/docs/local-api/overview

Describes general options that can be applied to PayloadCMS Local API operations to modify default behavior, such as error handling or transaction initialization.

```APIDOC
disableErrors: When set to `true`, errors will not be thrown. Instead, the `findByID` operation will return `null`, and the `find` operation will return an empty documents array.
disableTransaction: When set to `true`, a database transactions will not be initialized.
```

--------------------------------

### Configure Optional Payload Cloud Plugin Features

Source: https://payloadcms.com/docs/cloud/projects

Demonstrates how to pass options to the `payloadCloudPlugin` function to disable specific features like file storage or email delivery. This allows for fine-grained control over which cloud services are utilized.

```typescript
payloadCloud({
  storage: false, // Disable file storage
  email: false // Disable email delivery
})
```

--------------------------------

### Payload CMS: Defining a Custom ID Field

Source: https://payloadcms.com/docs/fields/overview

Explains how to override the default ID field generation in Payload CMS collections by defining a custom `id` field. This example sets a `number` type ID field as required. Custom ID fields can be of type `Number` or `Text`, with `text` types having restrictions on characters.

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  // ...
  fields: [
    {
      name: 'id',
      required: true,
      type: 'number',
    },
  ],
}
```

--------------------------------

### PayloadCMS GlobalConfig Admin Options API

Source: https://payloadcms.com/docs/configuration/globals

Detailed API documentation for the `admin` property within a PayloadCMS GlobalConfig, outlining available options like `group`, `hidden`, `components`, `preview`, `livePreview`, `hideAPIURL`, and `meta`, along with their descriptions.

```APIDOC
GlobalConfig.admin:
  group: string | object | false
    Description: Text or localization object used to group Collection and Global links in the admin navigation. Set to false to hide the link from the navigation while keeping its routes accessible.
  hidden: boolean | function
    Description: Set to true or a function, called with the current user, returning true to exclude this Global from navigation and admin routing.
  components: object
    Description: Swap in your own React components to be used within this Global. (See Custom Components section for details)
  preview: function
    Description: Function to generate a preview URL within the Admin Panel for this Global that can point to your app.
  livePreview: boolean
    Description: Enable real-time editing for instant visual feedback of your front-end application.
  hideAPIURL: boolean
    Description: Hides the "API URL" meta field while editing documents within this collection.
  meta: object
    Description: Page metadata overrides to apply to this Global within the Admin Panel.
```

--------------------------------

### Create Custom Payload CMS Date Field Label Server Component

Source: https://payloadcms.com/docs/fields/date

Provides an example of a custom server-side React component for a Payload CMS date field's label. It uses 'FieldLabel' from the Payload CMS UI library to display the field's label or name, along with its required status.

```TypeScript
import React from 'react'
import { FieldLabel } from '@payloadcms/ui'
import type { DateFieldLabelServerComponent } from 'payload'

export const CustomDateFieldLabelServer: DateFieldLabelServerComponent = ({
  clientField,
  path,
}) => {
  return (
    <FieldLabel
      label={clientField?.label || clientField?.name}
      path={path}
      required={clientField?.required}
    />
  )
}
```

--------------------------------

### Payload Point Field Configuration Options

Source: https://payloadcms.com/docs/fields/point

Detailed API documentation for configuring a Point field in Payload CMS. This section lists all available properties, their descriptions, and whether they are required, covering aspects like naming, labeling, uniqueness, indexing, validation, and access control.

```APIDOC
Point Field Configuration Options:
  name (required): To be used as the property name when stored and retrieved from the database.
  label: Used as a field label in the Admin Panel and to name the generated GraphQL type.
  unique: Enforce that each entry in the Collection has a unique value for this field.
  index: Build an index for this field to produce faster queries. To support location queries, point index defaults to `2dsphere`, to disable the index set to `false`.
  validate: Provide a custom validation function that will be executed on both the Admin Panel and the backend.
  saveToJWT: If this field is top-level and nested in a config supporting Authentication, include its data in the user JWT.
  hooks: Provide Field Hooks to control logic for this field.
  access: Provide Field Access Control to denote what users can see and do with this field's data.
  hidden: Restrict this field's visibility from all APIs entirely. Will still be saved to the database, but will not appear in any API or the Admin Panel.
  defaultValue: Provide data to be used for this field's default value.
  localized: Enable localization for this field. Requires localization to be enabled in the Base config.
  required: Require this field to have a value.
  admin: Admin-specific configuration.
  custom: Extension point for adding custom data (e.g. for plugins).
  typescriptSchema: Override field type generation with providing a JSON schema.
  virtual: Provide `true` to disable field in the database, or provide a string path to link the field with a relationship.
```

--------------------------------

### Implement UI Field in Payload CMS Collection Configuration

Source: https://payloadcms.com/docs/fields/ui

This example illustrates how to integrate a UI field into a Payload CMS collection's configuration. It demonstrates defining a UI field with a specific `name` and `type`, and crucially, linking custom React components for both the `Field` (for the edit view) and `Cell` (for the list view) via the `admin.components` property, enabling comprehensive customization of the UI field's appearance and behavior within the Admin Panel.

```TypeScript
import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'myCustomUIField', // required
      type: 'ui', // required
      admin: {
        components: {
          Field: '/path/to/MyCustomUIField',
          Cell: '/path/to/MyCustomUICell'
        }
      }
    }
  ]
}
```

--------------------------------

### Payload CMS Server Function with Role-Based Access Control

Source: https://payloadcms.com/docs/local-api/server-functions

This JavaScript/TypeScript example illustrates how to enforce role-based access control within a Payload CMS server function. It checks if the authenticated user has the 'admin' role before allowing the 'payload.delete' operation, preventing unauthorized users from performing sensitive actions.

```javascript
export async function deletePost(postId, user) {
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  const payload = await getPayload({ config })
  return await payload.delete({ collection: 'posts', id: postId })
}
```

--------------------------------

### Payload CMS Field Admin Property Options Reference

Source: https://payloadcms.com/docs/fields/overview

Comprehensive documentation of available options within the `admin` property of a Payload CMS Field Config, detailing their purpose and impact on the Admin Panel UI and editor experience.

```APIDOC
admin:
  condition: Programmatically show / hide fields based on other fields.
  components: All Field Components can be swapped out for Custom Components that you define.
  description: Helper text to display alongside the field to provide more information for the editor.
  position: Specify if the field should be rendered in the sidebar by defining 'position: 'sidebar''.
  width: Restrict the width of a field. Can be any string-based value (pixels, percentages, etc.). Useful in Row types for horizontal organization.
  style: CSS Properties to inject into the root element of the field.
  className: Attach a CSS class attribute to the root DOM element of a field.
  readOnly: Disables the admin component's editability to prevent editors from modifying the field's value (no effect on API).
  disabled: If a field is disabled, it is completely omitted from the Admin Panel entirely.
  disableBulkEdit: Set to true to prevent fields from appearing in select options when making edits for multiple documents. Defaults to true for UI fields.
  disableListColumn: Set to true to prevent fields from appearing in the list view column selector.
  disableListFilter: Set to true to prevent fields from appearing in the list view filter options.
  hidden: Transforms the field into a hidden input type. Its value will still submit with requests in the Admin Panel, but the field itself will not be visible to editors.
```

--------------------------------

### Extend Nested Docs Plugin Fields with Overrides

Source: https://payloadcms.com/docs/plugins/nested-docs

Example demonstrating how to use `createParentField` and `createBreadcrumbsField` methods to extend and customize the built-in `parent` and `breadcrumbs` fields. These methods allow merging custom configurations, such as admin panel position or label, with the plugin's base field definitions. The first argument is the collection slug, and the second is an object of field overrides.

```TypeScript
import type { CollectionConfig } from 'payload'
import { createParentField } from '@payloadcms/plugin-nested-docs'
import { createBreadcrumbsField } from '@payloadcms/plugin-nested-docs'

const examplePageConfig: CollectionConfig = {
  slug: 'pages',
  fields: [
    createParentField(
      // First argument is equal to the slug of the collection
      // that the field references
      'pages',

      // Second argument is equal to field overrides that you specify,
      // which will be merged into the base parent field config
      {
        admin: {
          position: 'sidebar',
        },
        // Note: if you override the `filterOptions` of the `parent` field,
        // be sure to continue to prevent the document from referencing itself as the parent like this:
        // filterOptions: ({ id }) => ({ id: {not_equals: id }})
      },
    ),
    createBreadcrumbsField(
      // First argument is equal to the slug of the collection
      // that the field references
      'pages',

      // Argument equal to field overrides that you specify,
      // which will be merged into the base `breadcrumbs` field config
      {
        label: 'Page Breadcrumbs',
      },
    ),
  ],
}
```

--------------------------------

### Payload CMS: Restrict Read Access to Published Documents for Unauthenticated Users

Source: https://payloadcms.com/docs/versions/drafts

This TypeScript example demonstrates how to configure Payload CMS collection access control. It allows authenticated users to retrieve all documents, while unauthenticated users are restricted to viewing only documents where the `_status` field is 'published'. This is essential for controlling the visibility of draft content.

```typescript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: ({ req }) => {
      // If there is a user logged in,
      // let them retrieve all documents
      if (req.user) return true

      // If there is no user,
      // restrict the documents that are returned
      // to only those where `_status` is equal to `published`
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  versions: {
    drafts: true,
  },
  //.. the rest of the Pages config here
}
```

--------------------------------

### Create New Payload CMS Migration File

Source: https://payloadcms.com/docs/database/migrations

The `pnpm payload migrate:create` command generates a new migration file. For relational databases, it automatically generates SQL changes based on schema differences; for MongoDB, it creates a template for data transformation logic.

```Shell
pnpm payload migrate:create
```

--------------------------------

### Mutate Payload's Internal Raw SQL Schema for Generated DB Schema

Source: https://payloadcms.com/docs/database/sqlite

This advanced example illustrates how to directly manipulate Payload's internal 'raw' SQL schema (`adapter.rawTables`) within the `beforeSchemaInit` hook. This method ensures that custom tables or columns, not defined through Drizzle or Payload's config, are included when generating the Drizzle schema via `payload generate:db-schema`.

```typescript
import { sqliteAdapter } from '@payloadcms/db-sqlite'

sqliteAdapter({
  beforeSchemaInit: [
    ({ schema, adapter }) => {
      // Add a new table
      adapter.rawTables.myTable = {
        name: 'my_table',
        columns: {
          my_id: {
            name: 'my_id',
            type: 'integer',
            primaryKey: true
          }
        }
      }

      // Add a new column to generated by Payload table:
      // (The original text was truncated here, providing the available part.)
    }
  ]
})
```

--------------------------------

### Configure Payload Plugins in buildConfig

Source: https://payloadcms.com/docs/plugins/overview

This snippet demonstrates the basic structure for integrating plugins into a Payload application. Plugins are added as an array to the `plugins` property within the `buildConfig` function, allowing for easy extension of Payload's core functionality.

```JavaScript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  plugins: [
    // Add Plugins here
  ],
})
```

--------------------------------

### Payload GraphQL Mutations for Globals

Source: https://payloadcms.com/docs/graphql/overview

Table listing the automatically generated GraphQL mutation available for a Payload Global, specifically the `update` operation.

```APIDOC
Query Name | Operation
--- | ---
`updateHeader` | `update`
```

--------------------------------

### Retrieve Localized Documents via Payload CMS GraphQL API

Source: https://payloadcms.com/docs/configuration/localization

This section explains how to specify locale and fallback locale using arguments in GraphQL queries for Payload CMS. The `locale` argument accepts valid locales, which are automatically formatted for GraphQL. The `fallbackLocale` argument accepts valid locales or `none` to disable fallback. The example demonstrates a GraphQL query for 'Posts' with both `locale` and `fallbackLocale` arguments.

```APIDOC
In the GraphQL API, you can specify `locale` and `fallbackLocale` args to all relevant queries and mutations.

The `locale` arg will only accept valid locales, but locales will be formatted automatically as valid GraphQL enum values (dashes or special characters will be converted to underscores, spaces will be removed, etc.).

The `fallbackLocale` arg will accept valid locales as well as `none` to disable falling back.
```

```GraphQL
query {
  Posts(locale: de, fallbackLocale: none) {
    docs {
      title
    }
  }
}
```

--------------------------------

### Handle Internal Links in RichText JSX Conversion

Source: https://payloadcms.com/docs/rich-text/converting-jsx

This example shows how to resolve internal links within rich text content when converting to JSX. It provides a custom `internalDocToHref` function to the `LinkJSXConverter` to map Payload document relations (e.g., 'posts', 'categories', 'pages') to their corresponding frontend URLs, preventing 'found internal link, but internalDocToHref is not provided' errors in the console.

```tsx
import type {
DefaultNodeTypes,
SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import {
type JSXConvertersFunction,
LinkJSXConverter,
RichText,
} from '@payloadcms/richtext-lexical/react'
import React from 'react'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
const { relationTo, value } = linkNode.fields.doc!
if (typeof value !== 'object') {
throw new Error('Expected value to be an object')
}
const slug = value.slug

switch (relationTo) {
case 'posts':
return `/posts/${slug}`
case 'categories':
return `/category/${slug}`
case 'pages':
return `/${slug}`
default:
return `/${relationTo}/${slug}`
}
}

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
defaultConverters,
}) => ({
...defaultConverters,
...LinkJSXConverter({ internalDocToHref }),
})

export const MyComponent: React.FC<{
lexicalData: SerializedEditorState
}> = ({ lexicalData }) => {
return <RichText converters={jsxConverters} data={lexicalData} />
}
```

--------------------------------

### Integrate Custom Upload Component in Payload CMS Collections

Source: https://payloadcms.com/docs/custom-components/edit-view

Explains how to replace the default file upload component in Payload CMS collections with a custom React component. It provides the necessary configuration within `CollectionConfig` to link the custom component and a basic example of a custom upload component that renders an HTML input.

```typescript
import type { CollectionConfig } from 'payload';

export const MyCollection: CollectionConfig = {
  // ...
  admin: {
    components: {
      edit: {
        Upload: '/path/to/MyUploadComponent'
      }
    }
  }
};
```

```typescript
import React from 'react';

export function MyUploadComponent() {
  return <input type="file" />;
}
```

--------------------------------

### Payload Admin Panel Configuration Structure

Source: https://payloadcms.com/docs/admin/overview

This TypeScript snippet demonstrates the basic structure for defining Admin Panel options within the Payload configuration file, utilizing the `buildConfig` function and the `admin` property.

```TypeScript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    // ...
  },
})
```

--------------------------------

### Configure Payload CMS to Include Custom Bin Script

Source: https://payloadcms.com/docs/configuration/overview

This configuration snippet shows how to register a custom script, such as the seeding script, within the Payload CMS `buildConfig`. It specifies the `scriptPath` to the TypeScript file and assigns a unique `key` ('seed') that can be used to invoke the script via the command line.

```typescript
export default buildConfig({
bin: [
{
scriptPath: path.resolve(dirname, 'seed.ts'),
key: 'seed'
}
]
})
```

--------------------------------

### Importing Editor Config Factory and Types

Source: https://payloadcms.com/docs/rich-text/converters

Before retrieving the editor configuration, import the necessary types from 'payload' and the `editorConfigFactory` utility from '@payloadcms/richtext-lexical'. A `SanitizedConfig` instance is also required as a dependency for the factory methods.

```TypeScript
import type { SanitizedConfig } from 'payload'
import { editorConfigFactory } from '@payloadcms/richtext-lexical'

// Your Payload Config needs to be available in order to retrieve the default editor config
const config: SanitizedConfig = {} as SanitizedConfig
```

--------------------------------

### Define Custom Dropdown Toolbar Group for Payload CMS Lexical Editor

Source: https://payloadcms.com/docs/rich-text/custom-features

This TypeScript example illustrates how to create a custom 'dropdown' type toolbar group for the Payload CMS Lexical rich text editor. It defines a function that accepts an array of toolbar items and returns a `ToolbarGroup` object, including a `ChildComponent` for the dropdown button, its type, key, and order.

```TypeScript
import type {
  ToolbarGroup,
  ToolbarGroupItem,
} from '@payloadcms/richtext-lexical'

import { MyIcon } from './icons/MyIcon'

export const toolbarAddDropdownGroupWithItems = (
  items: ToolbarGroupItem[],
): ToolbarGroup => {
  return {
    type: 'dropdown',
    ChildComponent: MyIcon,
    items,
    key: 'myDropdownToolbar',
    order: 10,
  }
}
```

--------------------------------

### Define Code Field in Payload Collection

Source: https://payloadcms.com/docs/fields/code

This example demonstrates how to integrate a Code Field named `trackingCode` into a Payload CMS collection configuration. It shows how to set the field as required and specify a default language for syntax highlighting within the admin panel using the `admin.language` option, enhancing the editor's usability for specific code types.

```typescript
import type { CollectionConfig } from 'payload';

export const ExampleCollection: CollectionConfig = {
  slug: 'example-collection',
  fields: [
    {
      name: 'trackingCode', // required
      type: 'code', // required
      required: true,
      admin: {
        language: 'javascript',
      },
    },
  ],
}
```

--------------------------------

### Execute Payload Standalone Script with Bun Runtime

Source: https://payloadcms.com/docs/local-api/outside-nextjs

This shell command illustrates how to run a Payload standalone script using the Bun runtime, explicitly disabling Payload's internal transpilation with the `--disable-transpile` flag. This option provides flexibility for users who prefer Bun, but it's important to note that official support for alternative runtimes is not guaranteed.

```Shell
bunx --bun payload run src/seed.ts --disable-transpile
```

--------------------------------

### Custom Textarea Field Label Client Component in Payload CMS

Source: https://payloadcms.com/docs/fields/textarea

This client-side React component provides an example of creating a custom label for a textarea field within Payload CMS. Similar to its server-side counterpart, it leverages Payload's `FieldLabel` component, adapting to client-side rendering by accepting `field` props to display the label, path, and required status.

```typescript
'use client'
import React from 'react'
import { FieldLabel } from '@payloadcms/ui'
import type { TextareaFieldLabelClientComponent } from 'payload'

export const CustomTextareaFieldLabelClient: TextareaFieldLabelClientComponent =
  ({ field, path }) => {
    return (
      <FieldLabel
        label={field?.label || field?.name}
        path={path}
        required={field?.required}
      />
    )
  }
```

--------------------------------

### Payload CMS `pasteURL` Configuration Options API Reference

Source: https://payloadcms.com/docs/upload/overview

This API documentation outlines the possible values and their effects for the `pasteURL` option in Payload CMS upload configurations. It covers default client-side fetching, disabling the feature, and enabling secure server-side fetching via an `allowList`.

```APIDOC
pasteURL:
  undefined: Default behavior. Enables client-side fetching for internal or public URLs.
  false: Disables the ability to paste URLs into Upload fields.
  allowList: Enables server-side fetching for specific trusted URLs. Requires an array of objects defining trusted domains. See the table below for details on `AllowItem`.
```

--------------------------------

### useTenantSelection Hook Context Type API

Source: https://payloadcms.com/docs/plugins/multi-tenant

Defines the structure of the context object returned by the `useTenantSelection` React hook, including properties for available tenant options, the currently selected tenant ID, and methods for setting the tenant with optional refresh control.

```APIDOC
type ContextType = {
/**
* Array of options to select from
*/
options: OptionObject[]
/**
* The currently selected tenant ID
*/
selectedTenantID: number | string | undefined
/**
* Prevents a refresh when the tenant is changed
*
* If not switching tenants while viewing a "global", set to true
*/
setPreventRefreshOnChange: React.Dispatch<React.SetStateAction<boolean>>
/**
* Sets the selected tenant ID
*
* @param args.id - The ID of the tenant to select
* @param args.refresh - Whether to refresh the page after changing the tenant
*/
setTenant: (args: {
id: number | string | undefined
refresh?: boolean
}) => void
}
```

--------------------------------

### Define Payload CMS Database Seeding Function

Source: https://payloadcms.com/docs/plugins/build-your-own

This TypeScript function provides a template for seeding data in a Payload CMS application. It logs a message to the console and demonstrates how to create a new document in a specified collection. Developers can extend this function to add more seed data for various collections.

```TypeScript
export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding data...')

  await payload.create({
    collection: 'new-collection',
    data: {
      title: 'Seeded title',
    },
  })

  // Add additional seed data here
}
```

--------------------------------

### Payload Global Configuration Options Reference

Source: https://payloadcms.com/docs/configuration/globals

This section details the available configuration options for Payload Globals. It includes properties for access control, admin panel settings, custom database naming, field definitions, GraphQL integration, hooks, and other advanced settings to customize Global behavior and appearance.

```APIDOC
GlobalConfig:
  access: Provide Access Control functions to define exactly who should be able to do what with this Global.
  admin: The configuration options for the Admin Panel.
  custom: Extension point for adding custom data (e.g. for plugins).
  dbName: Custom table or collection name for this Global depending on the Database Adapter. Auto-generated from slug if not defined.
  description: Text or React component to display below the Global header to give editors more information.
  endpoints: Add custom routes to the REST API.
  fields*: Array of field types that will determine the structure and functionality of the data stored within this Global.
  graphQL: Manage GraphQL-related properties related to this global.
  hooks: Entry point for Hooks.
  label: Text for the name in the Admin Panel or an object with keys for each language. Auto-generated from slug if not defined.
  lockDocuments: Enables or disables document locking. By default, document locking is enabled. Set to an object to configure, or set to `false` to disable locking.
  slug*: Unique, URL-friendly string that will act as an identifier for this Global.
  typescript: An object with property `interface` as the text used in schema generation. Auto-generated from slug if not defined.
  versions: Set to true to enable default options, or configure with object properties.
  forceSelect: Specify which fields should be selected always, regardless of the `select` query which can be useful that the field exists for access control / hooks.
```

--------------------------------

### Payload Collection Authentication Configuration Options

Source: https://payloadcms.com/docs/authentication/overview

This section details the available configuration options for the `auth` property within a Payload Collection's configuration. Each option allows for fine-tuning authentication behavior, from cookie settings and token expiration to security features like login attempt limits and email verification, providing comprehensive control over user authentication flows.

```APIDOC
CollectionConfig.auth:
  cookies: Set cookie options, including `secure`, `sameSite`, and `domain`. For advanced users.
  depth: How many levels deep a `user` document should be populated when creating the JWT and binding the `user` to the `req`. Defaults to `0` and should only be modified if absolutely necessary, as this will affect performance.
  disableLocalStrategy: Advanced - disable Payload's built-in local auth strategy. Only use this property if you have replaced Payload's auth mechanisms with your own.
  forgotPassword: Customize the way that the `forgotPassword` operation functions.
  lockTime: Set the time (in milliseconds) that a user should be locked out if they fail authentication more times than `maxLoginAttempts` allows for.
  loginWithUsername: Ability to allow users to login with username/password.
  maxLoginAttempts: Only allow a user to attempt logging in X amount of times. Automatically locks out a user from authenticating if this limit is passed. Set to `0` to disable.
  removeTokenFromResponses: Set to true if you want to remove the token from the returned authentication API responses such as login or refresh.
  strategies: Advanced - an array of custom authentication strategies to extend this collection's authentication with.
  tokenExpiration: How long (in seconds) to keep the user logged in. JWTs and HTTP-only cookies will both expire at the same time.
  useAPIKey: Payload Authentication provides for API keys to be set on each user within an Authentication-enabled Collection.
  verify: Set to `true` or pass an object with verification options to require users to verify by email before they are allowed to log into your app.
```

--------------------------------

### Importing GraphQL Package for Typing

Source: https://payloadcms.com/docs/graphql/extending

Import statement for the `GraphQL` package used by Payload CMS. This import is primarily useful for type definitions and ensuring compatibility when extending GraphQL functionality.

```JavaScript
import { GraphQL } from '@payloadcms/graphql/types'
```

--------------------------------

### useField Hook Arguments Reference

Source: https://payloadcms.com/docs/admin/react-hooks

Provides a detailed reference for the arguments accepted by the `useField` hook. It outlines properties such as `path`, `validate`, `disableFormData`, and `hasRows`, explaining their function and impact on field behavior within the form.

```APIDOC
useField(args: object):
  path: string
    Description: If you do not provide a `path`, `name` will be used instead. This is the path to the field in the form data.
  validate: function
    Description: A validation function executed client-side *before* submitting the form to the server. Different than Field-level Validation which runs strictly on the server.
  disableFormData: boolean
    Description: If `true`, the field will not be included in the form data when the form is submitted.
  hasRows: boolean
    Description: If `true`, the field will be treated as a field with rows. This is useful for fields like `array` and `blocks`.
```

--------------------------------

### `beforeChange` Hook Arguments Reference

Source: https://payloadcms.com/docs/hooks/collections

This API documentation details the arguments provided to the `beforeChange` hook in Payload CMS. While the specific arguments are not fully detailed in the provided text, this entry serves as a placeholder for the structure of such API documentation.

```APIDOC
Arguments:
  Option: Description
```

--------------------------------

### Custom Image Name Generation for Resized Images

Source: https://payloadcms.com/docs/upload/overview

Demonstrates how to use the `generateImageName` function within an `imageSize` configuration to create custom file names for resized images based on their properties like height, width, and size name.

```JavaScript
{
  name: 'thumbnail',
  width: 400,
  height: 300,
  generateImageName: ({ height, sizeName, extension, width }) => {
    return `custom-${sizeName}-${height}-${width}.${extension}`
  }
}
```

--------------------------------

### Configure Admin Thumbnail Using a Custom Function

Source: https://payloadcms.com/docs/upload/overview

Shows how to provide a function for `adminThumbnail` that dynamically generates a full URL for the thumbnail based on the document data, useful for external storage solutions or custom logic.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    adminThumbnail: ({ doc }) =>
      `https://google.com/custom-path-to-file/${doc.filename}`,
  },
}
```

--------------------------------

### Configure AWS S3 Storage Adapter with Signed Downloads and Credentials

Source: https://payloadcms.com/docs/upload/storage-adapters

This JavaScript/TypeScript snippet demonstrates a partial configuration for the AWS S3 storage adapter in Payload CMS. It shows how to enable signed downloads for specific file types (e.g., MP4s) and how to set up S3 bucket credentials using environment variables. This configuration would typically reside within the `s3Storage` plugin options.

```TypeScript
collections: {
  // ... other collections
  'media-with-presigned-downloads': {
    // Filter only mp4 files
    signedDownloads: {
      shouldUseSignedURL: ({ collection, filename, req }) => {
        return filename.endsWith('.mp4')
      }
    }
  }
},
bucket: process.env.S3_BUCKET,
config: {
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  },
  region: process.env.S3_REGION,
  // ... Other S3 configuration
}
```

--------------------------------

### PayloadCMS useListQuery Hook Properties

Source: https://payloadcms.com/docs/admin/react-hooks

Documents the properties returned by the `useListQuery` hook, which provides data and query management for list views in PayloadCMS.

```APIDOC
useListQuery Hook Properties:
  data: The data that is being displayed in the List View.
  defaultLimit: The default limit of items to display in the List View.
  defaultSort: The default sort order of items to display in the List View.
  handlePageChange: A method to handle page changes in the List View.
  handlePerPageChange: A method to handle per page changes in the List View.
  handleSearchChange: A method to handle search changes in the List View.
  handleSortChange: A method to handle sort changes in the List View.
  handleWhereChange: A method to handle where changes in the List View.
  modified: Whether the query has been changed from its Query Preset.
  query: The current query that is being used to fetch the data in the List View.
```

--------------------------------

### MongoDB Mongoose Adapter Configuration Options

Source: https://payloadcms.com/docs/database/mongodb

This section details the various configuration options available for the `mongooseAdapter` in Payload. These options allow customization of Mongoose behavior, connection settings, schema handling, indexing, migrations, transactions, collation, and key handling.

```APIDOC
mongooseAdapter Options:
  autoPluralization: boolean
    Description: Tell Mongoose to auto-pluralize any collection names if it encounters any singular words used as collection `slug`s.
  connectOptions: object
    Description: Customize MongoDB connection options. Payload will connect to your MongoDB database using default options which you can override and extend to include all the options available to mongoose.
  collectionsSchemaOptions: object
    Description: Customize Mongoose schema options for collections.
  disableIndexHints: boolean
    Description: Set to true to disable hinting to MongoDB to use 'id' as index. This is currently done when counting documents for pagination, as it increases the speed of the count function used in that query. Disabling this optimization might fix some problems with AWS DocumentDB. Defaults to false.
  migrationDir: string
    Description: Customize the directory that migrations are stored.
  transactionOptions: object | false
    Description: An object with configuration properties used in transactions or `false` which will disable the use of transactions.
  collation: object
    Description: Enable language-specific string comparison with customizable options. Available on MongoDB 3.4+. Defaults locale to "en". Example: `{ strength: 3 }`. For a full list of collation options and their definitions, see the MongoDB documentation.
  allowAdditionalKeys: boolean
    Description: By default, Payload strips all additional keys from MongoDB data that don't exist in the Payload schema. If you have some data that you want to include to the result but it doesn't exist in Payload, you can set this to `true`. Be careful as Payload access control *won't* work for this data.
  allowIDOnCreate: boolean
    Description: Set to `true` to use the `id` passed in data on the create API operations without using a custom ID field.
```

--------------------------------

### PayloadCMS GlobalConfig Admin Components Options API

Source: https://payloadcms.com/docs/configuration/globals

API documentation for the `admin.components` property, detailing options such as `elements` for overriding Edit View elements and `views` for custom admin panel views, enabling granular UI customization for Globals.

```APIDOC
GlobalConfig.admin.components:
  elements: object
    Description: Override or create new elements within the Edit View.
  views: object
    Description: Override or create new views within the Admin Panel.
```

--------------------------------

### Access User Role and ID from JWT in Payload CMS Access Control

Source: https://payloadcms.com/docs/authentication/token-data

This TypeScript code snippet illustrates how to use the `req.user` object, which contains data from the JWT token, within Payload CMS access control functions. It shows an example of checking a user's 'role' and 'id' to determine read access for an 'invoices' collection, allowing 'super-admin' users full access or restricting access based on ownership.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  access: {
    read: ({ req, data }) => {
      if (!req?.user) return false
      if ({ req.user?.role === 'super-admin'}) {
        return true
      }
      return data.owner === req.user.id
    }
  },
  fields: [
    {
      name: 'owner',
      relationTo: 'users'
    },
    // ... other fields
  ],
}
```

--------------------------------

### Implement Payload CMS Live Preview API Route

Source: https://payloadcms.com/docs/admin/preview

This TypeScript API route handles live content preview requests, validating search parameters (path, collection, slug, previewSecret), authenticating the user via Payload's auth, and enabling draft mode before redirecting to the content path. It ensures only authorized users with the correct secret can access draft content.

```TypeScript
const payload = await getPayload({ config: configPromise })

const { searchParams } = new URL(req.url)

const path = searchParams.get('path')
const collection = searchParams.get('collection') as CollectionSlug
const slug = searchParams.get('slug')
const previewSecret = searchParams.get('previewSecret')

if (previewSecret !== process.env.PREVIEW_SECRET) {
  return new Response('You are not allowed to preview this page', {
    status: 403,
  })
}

if (!path || !collection || !slug) {
  return new Response('Insufficient search params', { status: 404 })
}

if (!path.startsWith('/')) {
  return new Response(
    'This endpoint can only be used for relative previews',
    { status: 500 },
  )
}

let user

try {
  user = await payload.auth({
    req: req as unknown as PayloadRequest,
    headers: req.headers,
  })
} catch (error) {
  payload.logger.error(
    { err: error },
    'Error verifying token for live preview',
  )
  return new Response('You are not allowed to preview this page', {
    status: 403,
  })
}

const draft = await draftMode()

if (!user) {
  draft.disable()
  return new Response('You are not allowed to preview this page', {
    status: 403,
  })
}

// You can add additional checks here to see if the user is allowed to preview this page

draft.enable()

redirect(path)
```

--------------------------------

### Payload Configuration for Custom Domain serverURL

Source: https://payloadcms.com/docs/cloud/projects

This TypeScript code snippet demonstrates how to configure the serverURL in your payload.config.ts file. This setting is crucial when using a custom domain with your Payload Cloud project, ensuring that the application correctly resolves its own URL.

```TypeScript
export default buildConfig({
serverURL: 'https://example.com',
// the rest of your config,
})
```

--------------------------------

### Configure Admin Thumbnail Using Image Size Name

Source: https://payloadcms.com/docs/upload/overview

Illustrates how to set the `adminThumbnail` property to a string, referencing one of the defined `imageSizes` names, to specify which resized image should be used as the admin panel thumbnail.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    adminThumbnail: 'small',
    imageSizes: [
      {
        name: 'small',
        fit: 'cover',
        height: 300,
        width: 900,
      },
      {
        name: 'large',
        fit: 'cover',
        height: 600,
        width: 1800,
      },
    ],
  },
}
```

--------------------------------

### Opting Out of Static Site Generation (SSG) in Next.js

Source: https://payloadcms.com/docs/production/building-without-a-db-connection

This JavaScript snippet demonstrates how to disable Static Site Generation (SSG) for a specific route segment in Next.js by forcing dynamic rendering. Adding `export const dynamic = 'force-dynamic'` to a route file ensures that the page is rendered dynamically, removing the build-time database connection requirement, though it may impact performance.

```JavaScript
export const dynamic = 'force-dynamic'
```

--------------------------------

### TypeScript Config for Payload Development Root Directory

Source: https://payloadcms.com/docs/configuration/overview

Configuration for `tsconfig.json` in development mode, specifying the `rootDir` where Payload will look for the configuration file if not found at the root. This helps Payload locate the config within a source directory.

```JSON
{
  // ...
  "compilerOptions": {
    "rootDir": "src"
  }
}
```

--------------------------------

### Create New Payload Migration File

Source: https://payloadcms.com/docs/database/migrations

This command generates a new migration file in the configured migrations directory. You can optionally provide a custom name for the migration; otherwise, it defaults to a timestamp. It supports flags like `--skip-empty` and `--force-accept-warning` for automated environments.

```Shell
npm run payload migrate:create optional-name-here
```

--------------------------------

### API Reference: Nested Docs Plugin Options

Source: https://payloadcms.com/docs/plugins/nested-docs

Documentation for the configuration options available when initializing the `nestedDocsPlugin`. These options allow customization of which collections the plugin applies to and how breadcrumb labels and URLs are generated.

```APIDOC
collections:
  Type: string[]
  Description: An array of collection slugs to which the nested docs functionality will be applied.
generateLabel:
  Type: function((parentDoc: object | undefined, currentDoc: object) => string)
  Description: A function to dynamically set the `label` field of each breadcrumb. Receives the current document and its parent (if applicable).
generateURL:
  Type: function((docs: object[]) => string)
  Description: A function to dynamically set the `url` field of each breadcrumb. Receives an array of ancestor documents, allowing for custom URL generation based on the entire hierarchy.
```

--------------------------------

### Official Payload CMS Email Adapters Overview

Source: https://payloadcms.com/docs/email/overview

Lists the officially supported email adapters for Payload CMS, including their package names and a brief description of their capabilities and use cases.

```APIDOC
Official Email Adapters:
  Nodemailer (@payloadcms/email-nodemailer):
    Description: Use any Nodemailer transport (SMTP, Resend, SendGrid, etc.). Easiest migration path from Payload 2.x.
  Resend (@payloadcms/email-resend):
    Description: Resend email via their REST API. Preferred for serverless platforms like Vercel due to lightweight nature.
```

--------------------------------

### PayloadCMS: Query Preset Constraint Options API Reference

Source: https://payloadcms.com/docs/query-presets/overview

This API documentation outlines the configuration options available when defining custom query preset constraints in PayloadCMS. These properties allow developers to specify the display label, internal value, associated fields for conditional rendering, and the access control logic for each custom constraint.

```APIDOC
Constraint Options:
  label: string
    Description: The label to display in the dropdown for this constraint.
  value: string
    Description: The value to store in the database when this constraint is selected.
  fields: Array<Field>
    Description: An array of Payload fields to render when this constraint is selected.
  access: Function
    Description: A function that determines the access control rules for this constraint.
                 Signature: ({ req: Request, user: User }) => AccessControlRules
```

--------------------------------

### Payload CMS: Importing External Drizzle Schemas via `beforeSchemaInit`

Source: https://payloadcms.com/docs/database/postgres

Shows how to integrate pre-existing Drizzle ORM schema definitions (e.g., from a `schema.ts` file generated by Drizzle Introspection) into Payload CMS's database configuration. The `beforeSchemaInit` hook is used to append these external tables to Payload's schema before initialization.

```TypeScript
import { postgresAdapter } from '@payloadcms/db-postgres';
import { users, countries } from '../drizzle/schema';

postgresAdapter({
  beforeSchemaInit: [
    ({ schema, adapter }) => {
      return {
        ...schema,
        tables: {
          ...schema.tables,
          users,
          countries
        }
      };
    }
  ]
});
```

--------------------------------

### Payload CMS Cloud Storage Plugin Options

Source: https://payloadcms.com/docs/upload/storage-adapters

Configuration options for the `@payloadcms/plugin-cloud-storage` plugin, which can be applied globally or to specific collections to manage cloud storage behavior.

```APIDOC
Option: collections
  Type: Record<string, CollectionOptions>
  Description: Object with keys set to the slug of collections you want to enable the plugin for, and values set to collection-specific options. Required.
Option: enabled
  Type: boolean
  Description: To conditionally enable/disable plugin.
  Default: true
```

--------------------------------

### Enable Content Source Maps in Payload Local API Requests

Source: https://payloadcms.com/docs/integrations/vercel-content-link

When using Payload's Local API, enable Content Source Maps by passing `encodeSourceMaps: true` within the `context` property of your API calls. Similar to REST API, this should be restricted to draft or preview environments for performance considerations.

```javascript
if (isDraftMode || process.env.VERCEL_ENV === 'preview') {
  const res = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
    context: {
      encodeSourceMaps: true,
    },
  })
}
```

--------------------------------

### Configure `useLivePreview` Hook Depth in Payload CMS

Source: https://payloadcms.com/docs/live-preview/client

This snippet shows the configuration of the `useLivePreview` React hook in Payload CMS, emphasizing the importance of the `depth` parameter. It ensures that the live preview data matches the depth of the initial data request, preventing inconsistencies with relationships and uploads during live editing.

```TypeScript
const { data } = useLivePreview<PageType>({
initialData: initialPage,
serverURL: PAYLOAD_SERVER_URL,
depth: 1 // Ensure this matches the depth of your initial request
})
```

--------------------------------

### Configure Payload Collection for File Uploads with Image Resizing

Source: https://payloadcms.com/docs/upload/overview

This TypeScript code defines a Payload CMS `CollectionConfig` named 'Media' that enables file upload functionality. It configures a static directory, defines multiple `imageSizes` for automatic resizing (thumbnail, card, tablet), sets 'thumbnail' as the admin panel preview, and restricts MIME types to images. It also includes a simple 'alt' text field.

```TypeScript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre'
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre'
      },
      {
        name: 'tablet',
        width: 1024,
        // By specifying `undefined` or leaving a height undefined,
        // the image will be sized to a certain width,
        // but it will retain its original aspect ratio
        // and calculate a height automatically.
        height: undefined,
        position: 'centre'
      }
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*']
  },
  fields: [
    {
      name: 'alt',
      type: 'text'
    }
  ]
}
```

--------------------------------

### Configure Payload CMS with Stripe Plugin

Source: https://payloadcms.com/docs/plugins/stripe

This code snippet demonstrates how to configure the Payload CMS application to integrate with the Stripe plugin. It sets up the Stripe secret key and webhook endpoint secret, and crucially, defines a `sync` configuration for the 'customers' collection. The `sync` option ensures that specified fields, like 'name', are synchronized between Payload CMS and Stripe customer resources.

```typescript
import { buildConfig } from 'payload'

import stripePlugin from '@payloadcms/plugin-stripe'

const config = buildConfig({
  plugins: [
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET,
      sync: [
        {
          collection: 'customers',
          stripeResourceType: 'customers',
          stripeResourceTypeSingular: 'customer',
          fields: [
            {
              fieldPath: 'name', // this is a field on your own Payload Config
              stripeProperty: 'name', // use dot notation, if applicable
            },
          ],
        },
      ],
    }),
  ],
})

export default config
```

--------------------------------

### TypeScript Config for Payload Production Output Directory

Source: https://payloadcms.com/docs/configuration/overview

Configuration for `tsconfig.json` in production mode, specifying `outDir` and `rootDir`. Payload will first check `outDir` for the config file, then fallback to `rootDir`, and finally the `dist` directory.

```JSON
{
  // ...
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

--------------------------------

### Configure Dynamic Live Preview URLs in Payload CMS

Source: https://payloadcms.com/docs/live-preview/overview

This snippet illustrates how to configure the `url` property of `admin.livePreview` as a function. This function receives document data, collection configuration, and locale, allowing for dynamic URL generation based on the content being edited. This is particularly useful for multi-tenant or localized applications.

```javascript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    // ...
    livePreview: {
      url: ({
        data,
        collectionConfig,
        locale
      }) => `${data.tenant.url}${ // Multi-tenant top-level domain
        collectionConfig.slug === 'posts' ? `/posts/${data.slug}` : `${data.slug !== 'home' ? `/${data.slug}` : ''}`
      }${locale ? `?locale=${locale?.code}` : ''}`, // Localization query param
      collections: ['pages'],
    },
  }
})
```

--------------------------------

### Payload CMS Admin Components Configuration Options

Source: https://payloadcms.com/docs/fields/overview

Lists the available properties under the `admin.components` object for customizing various parts of the Payload CMS admin interface. Each property corresponds to a specific UI element that can be overridden with a custom component.

```APIDOC
admin.components options:
  Field: The form field rendered of the Edit View.
  Cell: The table cell rendered of the List View.
  Filter: The filter component rendered in the List View.
  Label: Override the default Label of the Field Component.
  Error: Override the default Error of the Field Component.
  Diff: Override the default Diff component rendered in the Version Diff View.
  Description: Override the default Description of the Field Component.
  beforeInput: An array of elements that will be added before the input of the Field Component.
  afterInput: An array of elements that will be added after the input of the Field Component.
```

--------------------------------

### Postgres Adapter Configuration Options

Source: https://payloadcms.com/docs/database/postgres

This section outlines the various configuration options available for the Payload Postgres adapters. These options control aspects like connection pooling, schema management, migration behavior, and ID type settings.

```APIDOC
PostgresAdapterOptions:
  pool:
    type: object
    description: Pool connection options passed to Drizzle and `node-postgres` or `@vercel/postgres`. Required.
  push:
    type: boolean
    description: Disable Drizzle's `db push` in development mode. Default is enabled for development.
  migrationDir:
    type: string
    description: Customize the directory where migrations are stored.
  schemaName:
    type: string
    description: Postgres schema to use, defaults to 'public'. (experimental)
  idType:
    type: string ('serial' | 'uuid')
    description: Data type for id columns.
  transactionOptions:
    type: PgTransactionConfig | boolean
    description: PgTransactionConfig object for transactions, or `false` to disable.
  disableCreateDatabase:
    type: boolean
    description: Pass `true` to disable auto database creation if it doesn't exist. Defaults to `false`.
  localesSuffix:
    type: string
    description: String appended to table names for localized fields. Default is '_locales'.
  relationshipsSuffix:
    type: string
    description: String appended to table names for relationships. Default is '_rels'.
  versionsSuffix:
    type: string
    description: String appended to table names for versions. Defaults to '_v'.
  beforeSchemaInit:
    type: function
    description: Drizzle schema hook. Runs before the schema is built.
  afterSchemaInit:
    type: function
    description: Drizzle schema hook. Runs after the schema is built.
  generateSchemaOutputFile:
    type: string
    description: Override generated schema file path. Defaults to `{CWD}/src/payload-generated.schema.ts`.
  allowIDOnCreate:
    type: boolean
    description: Set to `true` to use the `id` passed in data on create API operations without a custom ID field.
  readReplicas:
    type: array<string>
    description: Array of DB read replicas connection strings for offloading read-heavy traffic.
```

--------------------------------

### React Hook: useTheme

Source: https://payloadcms.com/docs/admin/react-hooks

The `useTheme` hook returns the current theme ('light', 'dark', or 'auto'), a function to update it, and a boolean indicating if the theme is set automatically based on device preferences.

```React
'use client'

import { useTheme } from '@payloadcms/ui'

const MyComponent: React.FC = () => {
  const { autoMode, setTheme, theme } = useTheme()

  return (
    <>
      <span>
        The current theme is {theme} and autoMode is {autoMode}
      </span>
      <button
        type="button"
        onClick={() =>
          setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
      >
        Toggle theme
      </button>
    </>
  )
}
```

--------------------------------

### Set Query Depth for Initial Data Fetch in Payload CMS

Source: https://payloadcms.com/docs/live-preview/client

This code illustrates how to use the `payload.find` method to query a collection, specifically setting the `depth` parameter. The `depth` parameter is crucial for fetching related documents up to a specified level, preventing relationships or uploads from disappearing when editing documents in a live preview environment.

```TypeScript
const { docs } = await payload.find({
collection: 'pages',
depth: 1, // Ensure this is set to the proper depth for your application
where: {
slug: {
equals: 'home'
}
}
})
```

--------------------------------

### APIDOC: `crop` and `focalPoint` Upload Config Properties

Source: https://payloadcms.com/docs/upload/overview

Explains the `crop` and `focalPoint` boolean properties in the Upload configuration, used to disable their respective selectors in the Admin Panel.

```APIDOC
crop: boolean (default: true)
focalPoint: boolean (default: true)
  - Setting to `false` disables the selector in the Admin Panel.
```

--------------------------------

### Next.js API Route for Draft Mode Entry

Source: https://payloadcms.com/docs/admin/preview

This snippet provides the beginning of a Next.js API route (`/app/preview/route.ts`) designed to handle draft mode entry. It imports necessary modules from Payload and Next.js, including `draftMode` and `redirect`, indicating its purpose to verify a preview secret, authenticate, and activate Next.js Draft Mode.

```TypeScript
import type { CollectionSlug, PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import configPromise from '@payload-config'

export async function GET(
  req: {
    cookies: {
      get: (name: string) => {
        value: string
      }
    }

```

--------------------------------

### Retrieving and Displaying User Preferences in React

Source: https://payloadcms.com/docs/admin/preferences

This React component logic demonstrates how to fetch user preferences on component mount using `useEffect` and `getPreference`. It then displays the retrieved `lastUsedColors` and provides UI elements to trigger updates (which would call a function like `updateLastUsedColors` that uses `setPreference`).

```javascript
useEffect(() => {
const asyncGetPreference = async () => {
const lastUsedColorsFromPreferences = await getPreference(
lastUsedColorsPreferenceKey,
)
setLastUsedColors(lastUsedColorsFromPreferences)
}

asyncGetPreference()
}, [getPreference])

return (
<div>
<button type="button" onClick={() => updateLastUsedColors('red')}>
Use red
</button>
<button type="button" onClick={() => updateLastUsedColors('blue')}>
Use blue
</button>
<button type="button" onClick={() => updateLastUsedColors('purple')}>
Use purple
</button>
<button type="button" onClick={() => updateLastUsedColors('yellow')}>
Use yellow
</button>
{lastUsedColors && (
<Fragment>
<h5>Last used colors:</h5>
<ul>
{lastUsedColors?.map((color) => <li key={color}>{color}</li>)}
</ul>
</Fragment>
)}
</div>
)
```

--------------------------------

### Configure SEO Plugin generateDescription Function

Source: https://payloadcms.com/docs/plugins/seo

Shows how to configure the `generateDescription` function in the PayloadCMS SEO plugin to use a document's `excerpt` as its meta description. This function receives the same arguments as `generateTitle`.

```typescript
{
// ...
seoPlugin({
generateDescription: ({ doc }) => doc?.excerpt,
})
}
```

--------------------------------

### Payload CMS Local API: TypeScript Type Inference for Collection Create

Source: https://payloadcms.com/docs/local-api/overview

This snippet highlights Payload's automatic type inference capabilities when using the Local API with TypeScript. It demonstrates how the `payload.create` method correctly infers the type of the created document (e.g., `Post`), providing valuable type hints and ensuring type safety during development.

```TypeScript
const post = await payload.create({
  collection: 'posts',

  // Data will now be typed as Post and give you type hints
  data: {
    title: 'my title',
    description: 'my description',
  },
})
```

--------------------------------

### Configure Next.js for Standalone Output

Source: https://payloadcms.com/docs/production/deployment

This JavaScript snippet demonstrates how to set the 'output' property to 'standalone' in your Next.js configuration. This setting is crucial for creating a self-contained Next.js application build, which is highly beneficial for Docker deployments as it helps reduce the final image size and simplifies deployment.

```JavaScript
// next.config.js
const nextConfig = {
  output: 'standalone',
}
```

--------------------------------

### PayloadCMS useAuth Hook Properties

Source: https://payloadcms.com/docs/admin/react-hooks

Documents the properties and methods returned by the `useAuth` hook, providing information about the logged-in user and authentication actions.

```APIDOC
useAuth Hook Properties:
  user: The currently logged in user.
  logOut: A method to log out the currently logged in user.
  refreshCookie: A method to trigger the silent refreshing of a user's auth token.
  setToken: Set the token of the user, to be decoded and used to reset the user and token in memory.
  token: The logged in user's token (useful for creating preview links, etc.).
  refreshPermissions: Load new permissions (useful when content that affects permissions has been changed).
  permissions: The permissions of the current user.
```

--------------------------------

### Import Search Plugin TypeScript Types

Source: https://payloadcms.com/docs/plugins/search

This TypeScript snippet shows how to import specific type definitions provided by the PayloadCMS search plugin. It allows developers to use `SearchConfig` and `BeforeSync` types, ensuring type safety and better autocompletion when configuring the plugin or implementing its hooks. This improves code maintainability and reduces potential errors.

```TypeScript
import type { SearchConfig, BeforeSync } from '@payloadcms/plugin-search/types'
```

--------------------------------

### PayloadCMS: Create Document Server Function

Source: https://payloadcms.com/docs/local-api/server-functions

This server-side function, marked with `'use server'`, demonstrates how to securely create a new document in PayloadCMS. It utilizes `getPayload()` to access the Payload instance and `payload.create()` to insert data into a specified collection, including error handling for robust operation.

```JavaScript
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function createPost(data) {
  const payload = await getPayload({ config })

  try {
    const post = await payload.create({
      collection: 'posts',
      data,
    })
    return post
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`)
  }
}
```

--------------------------------

### `afterError` Hook Arguments Reference

Source: https://payloadcms.com/docs/hooks/overview

Documentation for the arguments passed to the `afterError` hook in Payload CMS. This hook provides contextual information about the error, request, and execution environment.

```APIDOC
afterError Hook Arguments:
  error: The error that occurred.
  context: Custom context passed between Hooks.
  graphqlResult: The GraphQL result object, available if the hook is executed within a GraphQL context.
  req: The `PayloadRequest` object that extends Web Request. Contains currently authenticated `user` and the Local API instance `payload`.
  collection: The Collection in which this Hook is running against. This will be `undefined` if the hook is executed from a non-collection endpoint or GraphQL.
  result: The formatted error result object, available if the hook is executed from a REST context.
```

--------------------------------

### Importing Payload CMS Lexical Block Utility Components

Source: https://payloadcms.com/docs/fields/blocks

This snippet demonstrates how to import various utility components from `@payloadcms/richtext-lexical/client` to assist with custom block rendering in Lexical. These components provide functionality for editing, removing, labeling, and containing blocks, reducing the need to build these features from scratch.

```TypeScript
import {
  // Edit block buttons (choose the one that corresponds to your usage)
  // When clicked, this will open a drawer with your block's fields
  // so your editors can edit them
  InlineBlockEditButton,
  BlockEditButton,

  // Buttons that will remove this block from Lexical
  // (choose the one that corresponds to your usage)
  InlineBlockRemoveButton,
  BlockRemoveButton,

  // The label that should be rendered for an inline block
  InlineBlockLabel,

  // The default "container" that is rendered for an inline block
  // if you want to re-use it
  InlineBlockContainer,

  // The default "collapsible" UI that is rendered for a regular block
  // if you want to re-use it
  BlockCollapsible,
} from '@payloadcms/richtext-lexical/client'
```

--------------------------------

### APIDOC: `generateImageName` Function Signature

Source: https://payloadcms.com/docs/upload/overview

Describes the parameters passed to the `generateImageName` function, which allows for custom naming of resized images within an `imageSize` configuration.

```APIDOC
generateImageName({ height: number, sizeName: string, extension: string, width: number }): string
```

--------------------------------

### Payload Root Configuration Properties

Source: https://payloadcms.com/docs/configuration/overview

A comprehensive list of top-level configuration properties available in Payload CMS, detailing their purpose and functionality. These properties control various aspects of the CMS behavior, from data indexing and file uploads to routing, email, and custom extensions.

```APIDOC
PayloadConfig:
  indexSortableFields: Automatically index all sortable top-level fields in the database to improve sort performance and add database compatibility for Azure Cosmos and similar.
  upload: Base Payload upload configuration.
  routes: Control the routing structure that Payload binds itself to.
  email: Configure the Email Adapter for Payload to use.
  onInit: A function that is called immediately following startup that receives the Payload instance as its only argument.
  debug: Enable to expose more detailed error information.
  telemetry: Disable Payload telemetry by passing `false`.
  hooks: An array of Root Hooks.
  plugins: An array of Plugins.
  endpoints: An array of Custom Endpoints added to the Payload router.
  custom: Extension point for adding custom data (e.g. for plugins).
  i18n: Internationalization configuration. Pass all i18n languages you'd like the admin UI to support. Defaults to English-only.
  secret*: A secure, unguessable string that Payload will use for any encryption workflows - for example, password salt / hashing.
  sharp: If you would like Payload to offer cropping, focal point selection, and automatic media resizing, install and pass the Sharp module to the config here.
  typescript: Configure TypeScript settings here.
```

--------------------------------

### Configure Global with Hooks Property

Source: https://payloadcms.com/docs/hooks/globals

This snippet demonstrates the basic structure for adding the `hooks` property to a Payload GlobalConfig. This property serves as the entry point for defining various lifecycle hooks that will run on the Global Document.

```TypeScript
import type { GlobalConfig } from 'payload'

export const GlobalWithHooks: GlobalConfig = {
// ...
hooks: {

// ...
},
}
```

--------------------------------

### Direct Import and Usage of PayloadCMS SEO Fields

Source: https://payloadcms.com/docs/plugins/seo

Shows how to directly import and use individual SEO fields (MetaDescriptionField, MetaImageField, MetaTitleField, OverviewField, PreviewField) from the PayloadCMS SEO plugin. This allows for flexible placement of SEO fields within your PayloadCMS configurations, with options to enable generation functions and specify data paths.

```typescript
import {
MetaDescriptionField,
MetaImageField,
MetaTitleField,
OverviewField,
PreviewField,
} from '@payloadcms/plugin-seo/fields'

// Used as fields
MetaImageField({
// the upload collection slug
relationTo: 'media',

// if the `generateImage` function is configured
hasGenerateFn: true,
})

MetaDescriptionField({
// if the `generateDescription` function is configured
hasGenerateFn: true,
})

MetaTitleField({
// if the `generateTitle` function is configured
hasGenerateFn: true,
})

PreviewField({
// if the `generateUrl` function is configured
hasGenerateFn: true,

// field paths to match the target field for data
titlePath: 'meta.title',
descriptionPath: 'meta.description',
})

OverviewField({
// field paths to match the target field for data

```

--------------------------------

### Run Pending Payload CMS Migrations

Source: https://payloadcms.com/docs/database/migrations

The `pnpm payload migrate` command executes any pending database migrations. This is used to apply schema changes or data transformations to the database.

```Shell
pnpm payload migrate
```

--------------------------------

### API Reference: `beforeSync` Function

Source: https://payloadcms.com/docs/plugins/search

The `beforeSync` function is an `afterChange` hook that executes just before a search record is created or updated. This powerful hook provides an opportunity to modify the data that will be stored in the search index or to provide fallback values. It receives both the `originalDoc` and the `searchDoc` as arguments, allowing for flexible data manipulation.

```APIDOC
beforeSync:
  Type: Function
  Parameters:
    - originalDoc: The original document being synced.
    - searchDoc: The search document generated by the plugin.
  Returns: Modified searchDoc object.
  Description: Runs before creating or updating a search record, allowing modification of data or providing fallbacks.
  Hook Type: afterChange
```

--------------------------------

### Importing Payload CMS SEO Plugin TypeScript Types

Source: https://payloadcms.com/docs/plugins/seo

Demonstrates the standard way to import essential TypeScript types from the `@payloadcms/plugin-seo/types` module. These types, including `PluginConfig`, `GenerateTitle`, `GenerateDescription`, and `GenerateURL`, are crucial for type-safe development when working with the SEO plugin.

```TypeScript
import type {
  PluginConfig,
  GenerateTitle,
  GenerateDescription,
  GenerateURL
} from '@payloadcms/plugin-seo/types';
```

--------------------------------

### Payload TypeScript Configuration Properties

Source: https://payloadcms.com/docs/configuration/overview

Options available under the `typescript` property in Payload's configuration, used for controlling auto-generation of TypeScript interfaces for collections and globals, and managing output file paths.

```APIDOC
PayloadConfig.typescript:
  autoGenerate: By default, Payload will auto-generate TypeScript interfaces for all collections and globals that your config defines. Opt out by setting `typescript.autoGenerate: false`.
  declare: By default, Payload adds a `declare` block to your generated types, which makes sure that Payload uses your generated types for all Local API methods. Opt out by setting `typescript.declare: false`.
  outputFile: Control the output path and filename of Payload's auto-generated types by defining the `typescript.outputFile` property to a full, absolute path.
```

--------------------------------

### Payload Task Configuration Options

Source: https://payloadcms.com/docs/jobs-queue/tasks

Describes the available options when defining a Task within the Payload configuration, including unique identifiers, handler definitions, input and output schema specifications, interface naming, human-friendly labels, and retry behavior for failure handling.

```APIDOC
TaskConfig:
  slug: string
    description: Define a slug-based name for this job. This slug needs to be unique among both tasks and workflows.
  handler: function | string
    description: The function that should be responsible for running the job. You can either pass a string-based path to the job function file, or the job function itself. If you are using large dependencies within your job, you might prefer to pass the string path because that will avoid bundling large dependencies in the Next.js app. Passing a string path is an advanced feature that may require a sophisticated build pipeline in order to work.
  inputSchema: array
    description: Define the input field schema - Payload will generate a type for this schema.
  interfaceName: string
    description: You can use interfaceName to change the name of the interface that is generated for this task. By default, this is "Task" + the capitalized task slug.
  outputSchema: array
    description: Define the output field schema - Payload will generate a type for this schema.
  label: string
    description: Define a human-friendly label for this task.
  onFail: function
    description: Function to be executed if the task fails.
  onSuccess: function
    description: Function to be executed if the task succeeds.
  retries: number | undefined
    description: Specify the number of times that this step should be retried if it fails. If this is undefined, the task will either inherit the retries from the workflow or have no retries. If this is 0, the task will not be retried. By default, this is undefined.
```

--------------------------------

### APIDOC: `req.payloadUploadSizes` Object Structure

Source: https://payloadcms.com/docs/upload/overview

Describes the structure of the `req.payloadUploadSizes` object, which provides access to automatically resized image data within Payload hooks. Each key corresponds to a generated image size, with its value being a buffer containing the file data.

```APIDOC
req.payloadUploadSizes: object
  - Keys: string (image size name)
  - Values: Buffer (file data)
```
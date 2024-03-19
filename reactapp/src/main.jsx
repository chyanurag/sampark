import React, { useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { NotificationProvider } from '@web3uikit/core'
import Test from './Test.jsx'

import './index.css'
const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>
    },
    {
        path: '/test',
        element: <Test/>
    }
])

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: 'https://api.studio.thegraph.com/query/68403/samparkaio/v0.0.6'
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
        <NotificationProvider>
            <RouterProvider router={router}>
                        <App />
            </RouterProvider>
        </NotificationProvider>
    </ApolloProvider>
  </React.StrictMode>,
)

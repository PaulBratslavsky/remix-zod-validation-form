import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from "./tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="w-[960px] mx-auto bg-slate-50">
        <nav className="bg-white text-black p-4 mt-4">
          <ul>
            <li>
              <Link to="/">Main Form</Link>
            </li>
            <li>
              <Link to="simple-form">Simple Form</Link>
            </li>
            <li>
              <Link to="/simple-zod-form">Zod Form</Link>
            </li>
          </ul>
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Mapbox configuration

Set `REACT_APP_MAPBOX_TOKEN` to a dedicated public (`pk.`) Mapbox access token before starting or building the app. For local development, copy `.env.example` to `.env.local` in this directory and fill in the value. For Netlify, set the same variable in the build environment and redeploy. No token is bundled by default.

The browser token is visible in the compiled JavaScript. Restrict it to the actual deployment origin(s), use only the public map-rendering permissions needed by the four existing Mapbox styles, and use a separate development token restricted to `http://localhost:3000` if needed. Do not use a secret token in the React app.

The historical Node scripts `data/geolocate.js` and `data-born/geolocate.js` require a separate `MAPBOX_GEOCODING_TOKEN` only when a city is not already cached. Export it in the shell before running either script from its own directory, for example:

```sh
export MAPBOX_GEOCODING_TOKEN='pk.your_geocoding_token'
cd data
node geolocate.js
```

Run this from the repository root (use `cd data-born` for the other script). The scripts do not load the app's environment files. Use a server-side token without browser URL restrictions and ensure your Mapbox geocoding plan and endpoint permit permanent storage before refreshing the cached data. The historical endpoint and cache behavior are unchanged.

After deploying the new browser token, revoke or rotate the old hardcoded tokens once any other consumers have migrated; removing them from current source does not remove them from Git history.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

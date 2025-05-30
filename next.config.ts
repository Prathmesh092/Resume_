import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Prevent 'async_hooks' from being bundled in the client
      config.resolve.alias = {
        ...config.resolve.alias,
        'async_hooks': false,
      };
      // Additionally, ignore problematic Node-specific OpenTelemetry packages on the client
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@opentelemetry\/sdk-trace-node$/,
        })
      );
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@opentelemetry\/context-async-hooks$/,
        })
      );
    }

    // Workaround for https://github.com/firebase/genkit/issues/1171
    // and possibly related to https://github.com/GoogleCloudPlatform/functions-framework-nodejs/issues/639
    // These modules are not always correctly excluded by Next.js/Webpack for server components.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(?:@google-cloud\/functions-framework|@opentelemetry\/sdk-trace-base)$/,
      })
    );


    return config;
  },
};

export default nextConfig;

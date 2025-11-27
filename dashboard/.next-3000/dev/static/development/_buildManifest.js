self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/api/:path*",
        "destination": "/api/:path*"
      },
      {
        "source": "/observation-lounge",
        "destination": "/reports/observation-lounge"
      },
      {
        "source": "/bridge/gallery/:path*"
      },
      {
        "source": "/bridge/quiz/:path*"
      },
      {
        "source": "/bridge/wizard/:path*"
      },
      {
        "source": "/bridge/control/:path*"
      },
      {
        "source": "/bridge/projects/alpha/:path*"
      },
      {
        "source": "/bridge/projects/beta/:path*"
      },
      {
        "source": "/bridge/projects/gamma/:path*"
      },
      {
        "source": "/bridge/projects/temporal/:path*"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()
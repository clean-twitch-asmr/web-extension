with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "clean-twitch-asmr";
  buildInputs = [
    nodejs-16_x
    gnumake
  ];

  NODE_ENV = "development";
  CHROME_DIST = "./chrome-dist";
}


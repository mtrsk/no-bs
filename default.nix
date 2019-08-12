{ pkgs ? import ./pinned-nixpkgs.nix {} }:

pkgs.stdenv.mkDerivation rec {
  name = "node-project-${version}";
  version = "0.0.1";

  buildInputs = with pkgs; [
    nodejs-11_x
    openssl
  ];
}

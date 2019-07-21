let
  pkgs = import ./pinned-nixpkgs.nix {};
  dev-deps = with pkgs; [
    npm2nix
  ];
in
(import ./default.nix {}).overrideAttrs (old: rec {
  buildInputs = old.buildInputs ++ dev-deps;
  shellHook = ''
    export PATH="$PWD/node_modules/.bin/:$PATH"
  '';
})

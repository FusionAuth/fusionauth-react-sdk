# needs kramdoc installed
# kramdoc handles comments more correctly than pandoc

# https://github.com/asciidoctor/kramdown-asciidoc
# To install (if you have ruby installed)
# gem install kramdown-asciidoc

kramdoc ../README.md --heading-offset=1 -o README.adoc

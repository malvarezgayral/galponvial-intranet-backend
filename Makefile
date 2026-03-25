DIRECTORIO_BASE=/usr/local/share/galponvial_backend
USUARIO_DESPLIEGUE=galponvial
GRUPO_DESPLIEGUE=galponvial
TARGET=dist/
NODE_MODULES=node_modules

BASE_SYSTEMD=/etc/systemd/system
SERVICIOS_SYSTEMD=systemd/galponvial_backend.service

.PHONY: help install deploy build

help :
	@echo "\nmake deploy"
	@echo "  Despliegue puro, debe hacerse desde el usuario $(USUARIO_DESPLIEGUE)"
	@echo "\nmake install"
	@echo "  Instalación completa, debe hacerse desde un usuario"
	@echo "  con privilegios de administrador (sudo)\n"

build :
	npm install
	npm audit fix || true
	npm run build

install : build
	sudo install -d -o $(USUARIO_DESPLIEGUE) -g $(GRUPO_DESPLIEGUE) -m 755 $(DIRECTORIO_BASE)
	sudo rsync -rlD --delete --exclude .env --exclude node_modules $(TARGET) $(DIRECTORIO_BASE)
	sudo rsync -rlD --delete $(NODE_MODULES) $(DIRECTORIO_BASE)
	sudo chown -R $(USUARIO_DESPLIEGUE):$(GRUPO_DESPLIEGUE) $(DIRECTORIO_BASE)
	sudo install -m 644 $(SERVICIOS_SYSTEMD) $(BASE_SYSTEMD)
	sudo systemctl daemon-reload
	sudo systemctl enable galponvial_backend
	sudo systemctl restart galponvial_backend

deploy :
	rsync -rlD --delete --exclude .env $(TARGET) $(DIRECTORIO_BASE)
	rsync -rlD --delete $(NODE_MODULES) $(DIRECTORIO_BASE)
	sudo systemctl restart galponvial_backend

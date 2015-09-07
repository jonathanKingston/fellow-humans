all:
	DISPLAY=:0 google-chrome --pack-extension=src --pack-extension-key=FellowHumans.pem
	mv src.crx FellowHumans.crx

#!/bin/bash
# Building EDM zip file

# PARAMS
TODAY="$( date +"%Y%m%d" )"
VERSION="$( git rev-parse --verify --short HEAD )"
FILE_NAME="../build/okada-nye-${VERSION}-${TODAY}.zip"

# Get OS type
case "$OSTYPE" in
  cygwin*)
    OS=Windows
    echo -e "\e[1;32mWARNING: Detected $OSTYPE...\e[0m"
    echo -e "\e[1;32mThis would not work well unless WSL...\e[0m"
  ;;
  linux-gnu*)
    OS=Linux
    echo -e "\e[1;32mNOTE: Detected Linux as \"$OSTYPE\"...\e[0m"
    # echo -e "\e[1;31mPress ENTER to continue...\e[0m"
    # read
  ;;
  linux*)
    OS=Linux
  ;;
  darwin*)
    OS=OSX
  ;;
  *)
    echo -e "\e[1;32mUnable to identify OS type $OSTYPE...\e[0m"
    # echo -e "\e[1;31mPress ENTER to continue...\e[0m"
    # read
    exit
  ;;
esac

# echo "Building zip file..."
echo -e "\e[1;31mBuilding zip file...\e[0m"

# Check if Linux
if [ "$OS" == "Linux" ]; then
  # Linux
  # Remove OSX directory links
  # rm -rf $FILE_NAME $IMAGES/__MACOSX/
  # Compress!
  (cd dist; zip -r -0 $FILE_NAME images scripts fonts stylesheets index.html)
else
  # For MacOSX
  (cd dist; zip -r -0 $FILE_NAME images scripts fonts stylesheets index.html)
fi
echo "Done creating ${FILE_NAME}"

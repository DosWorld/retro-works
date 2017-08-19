#!/bin/bash
jekyll b

cd _site
for fname in $(ls *.html); do
	fname=$(basename ${fname});
	iconv -ct gbk "${fname}" > "${fname%.*}.htm"
done;
rm *.html &>/dev/null
find . -iname \*.jpg -exec mogrify -resize '600x300>' {} \;
find . -iname \*.png | while read filepng; do
	filejpg="${filepng%.*}.jpg";
	convert "${filepng}" -resize '600x300>' -background "#FFFFFF" -flatten "${filejpg}"
	rm "${filepng}"
done;
cd ..

TARGET='myspace.img';
rm "${TARGET}"
dd if=/dev/zero of="${TARGET}" bs=512 count=2880
mformat -i "${TARGET}" -f 1440
mlabel -i "${TARGET}" ::MYSPACE
cd _site
mcopy -i "../${TARGET}" -s * ::/
cd ..
- Settings modal
- retry to load AI model if it fails
+ some text on top of nsfw blur saying NSFW, so its not just some blur, also saying Model is loading while the model is loading, because we keep it blured while also its loading
+ some picture grid gallery like on twitter, showing max 4 pics, others are showed as +1 23 4 5 etc, like on twitter
- audio, video, picture all same showed on the gallery
- all medias are after the text, no matter how they are encoded
- we say error and show the encoded post if decoding fails
- text in the post has a max height while its viewed on the timeline
- we never auto retry to load image because ipfs hash can be fake so we show retry button for user to retry to load the media
- and we somehow need isolate the post text, so harmful unicode characters doesnt ruin shit, have to look into that
- better sizing for the pictures, its kinda hard because we dont know the width and height of the image before loading it, so its kinda hard


- KOverlay should append at the bottom of the body
- ContentGallery modal should have a route, so people can go back on mobile or share it's link
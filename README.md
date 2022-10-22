> # ⚠️ This is an experimental project and should not be used in mainnet interactions. Please see the [`LICENSE`](https://github.com/hudsongraeme/flipper/blob/main/LICENSE.md)
>
> ### This extension is in ALPHA which means it's absolutely unsafe and not fit for use on mainnet. If you choose to use this, I am in no way liable for any bugs (trust me there are a lot), losses, rugs or cosmic bit flips<!-- lol -->.

# Flipper

<!-- Today you learned that HTML comments are supported in markdown -->

A chrome extension that adds convenient price suggestions to OpenSea's UI

## What

This is a chrome extension that adds buttons to the NFT listing view on OpenSea which allow for a quick 10%, 25% or 50% markup on the NFT you are planning to list. This plugin takes gas fees and protocol + creator fees into account when marking up your NFT so you get a clean percentage of profit at the end of the day.

## Why

Manually calculating profits after gas and protocol + creator fees sucks. After many, many times manually performing this calculation I finally got upset enough to put aside my expensive JPEG addiction and make a chrome plugin that would automatically ~~over~~price my images for me.

## Wen

- soon

## Rugmap

### Features that will be added

- Custom percentage values (admittedly, I used a polynomial calculator to figure percentages out and I seem to be limited to a max of 50% for some reason...)
- Auto listing duration selection
- Edit Listing support
- Support for offering (negative percentages or custom)
- Anything anyone opens an issue for. Literally anything as long as I can make it between 2 and 3AM on a Sunday. The more preposterous the issue, the better.

## Development

This extension was created with [Extension CLI](https://oss.mobilefirst.me/extension-cli/). Using this to spin up the plugin was sick and I recommend checking the project out if you want to make a plugin too without the boilerplate hassle.

As a proper web3 project, unit tests are irrelevant and QA is expected to be conducted on mainnet (or the test network named `polygon`)

I'll be maintaining this when possible for the forseeable future.

[&nbsp;]

[&nbsp;]: mailto:me@hudsongrae.me?subject=GM%20ser&body=GM%20Ser%2C%0A%0AI%20have%20discovered%20a%20new%20realm%20named%20GitHub%20Flavored%20Markdown.%0A%0A%0ARegards%2C%0A%0AAnon%0A%0A%0A%0APrivacy%20statement%3A%20If%20you%20are%20not%20the%20intended%20recipient%20of%20this%20message%2C%20please%20print%2019%20copies%20of%20this%20digital%20message%20using%20a%20LaserJet%20printer%20on%20paper%20of%20weight%20no%20less%20than%2098lb.%20Once%20printed%2C%20each%20page%20must%20be%20individually%20torched%20and%20the%20ashes%20must%20be%20placed%20into%20a%20letter%20sized%20envelope.%20The%20letter%20must%20then%20be%20routed%20to%20the%20original%20intended%20recipient%20of%20this%20email%20using%20the%20international%20postal%20service.%20The%20intended%20recipient%20will%20then%20in%20turn%20telegraph%20to%20acknowledge%20his%20receipt%20of%20this%20digital%20message%20and%20the%20original%20copy%20can%20be%20sent%20to%20dev%2Fnull%20or%20the%20%60node_modules%60%20folder%2C%20either%20of%20which%20will%20result%20in%20the%20file%20becoming%20too%20cumbersome%20to%20locate%20by%20any%20living%20soul. "Email me"

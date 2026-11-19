const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

// Ad-hoc sign each macOS .app before electron-builder creates its DMG.
// The macOS CI runner uses codesign; Linux cross-builds use rcodesign.
module.exports = async (context) => {
  if (context.electronPlatformName !== 'darwin') return

  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`,
  )

  if (!fs.existsSync(appPath)) {
    throw new Error(`macOS app bundle not found: ${appPath}`)
  }

  if (process.platform === 'darwin') {
    execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
      stdio: 'inherit',
    })
    execFileSync('codesign', ['--verify', '--deep', '--strict', appPath], {
      stdio: 'inherit',
    })
  } else {
    const rcodesign = process.env.RCODESIGN_PATH || 'rcodesign'
    try {
      execFileSync(rcodesign, ['sign', appPath], { stdio: 'inherit' })
    } catch (error) {
      throw new Error(
        `rcodesign is required to ad-hoc sign macOS builds on non-macOS hosts: ${error.message}`,
      )
    }
  }

  console.log(`[after-pack] ad-hoc signed ${appPath}`)
}

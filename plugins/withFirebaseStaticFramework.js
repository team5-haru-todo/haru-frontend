const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// @react-native-firebase가 iOS에서 최신 Xcode의 엄격한 모듈 검사 규칙과
// 충돌해서 "non-modular-include-in-framework-module" 에러가 나는 문제를 해결한다.
// Podfile의 post_install 훅에서, 모든 타겟에 non-modular header include를
// 허용하도록 빌드 설정을 강제로 켜준다.
function withFirebaseStaticFramework(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf-8');

      const staticFrameworkFlag = '$RNFirebaseAsStaticFramework = true';
      if (!contents.includes(staticFrameworkFlag)) {
        contents = `${staticFrameworkFlag}\n${contents}`;
      }

      const postInstallInjection = `
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end
`;

      if (!contents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
        contents = contents.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|\n${postInstallInjection}`
        );
      }

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
}

module.exports = withFirebaseStaticFramework;

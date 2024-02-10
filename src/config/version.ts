import { major, minVersion } from 'semver';

const VersionInfo = (semver: string) => {
  const isV5 = major(minVersion(semver)!) === 5;

  return isV5
    ? ({
        isV5,
        propName: { router: 'router', layerHandle: 'handleRequest', baseHandle: 'handle' },
      } as const)
    : ({
        isV5,
        propName: {
          router: '_router',
          layerHandle: 'handle_request',
          baseHandle: 'bound dispatch',
        },
      } as const);
};
type VersionInfo = ReturnType<typeof VersionInfo>;

export { VersionInfo };

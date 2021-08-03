import { CkitProvider } from 'ckit';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useConfigStorage } from 'hooks/useConfigStorage';

export const CkitProviderContainer = createContainer<CkitProvider | undefined>(() => {
  const [ckitProvider, setCkitProvider] = useState<CkitProvider>();
  const [localConfig] = useConfigStorage();
  useEffect(() => {
    if (!ckitProvider) {
      const provider = new CkitProvider();
      void provider.init(localConfig.ckitConfig).then(() => setCkitProvider(provider));
    }
  }, []);

  return ckitProvider;
});
# react-msal

>

[![NPM](https://img.shields.io/npm/v/react-msal.svg)](https://www.npmjs.com/package/react-msal) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-msal
```

## Usage

```tsx
import * as React from 'react'

import { useReactMSAL } from 'react-msal'

class Example extends React.Component {
  const reactMSAL = useReactMSAL({ config })

  useEffect(() => {
    console.log(reactMSAL.accessToken);
  }, [reactMSAL.accessToken]);

  render () {
    return (
      <Button onClick={reactMSAL.login} />
    )
  }
}
```

## License

MIT © [dlarssonse](https://github.com/dlarssonse)

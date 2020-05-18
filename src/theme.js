export default {
  breakpoints: ['40em', '52em', '64em'],
  fontSizes: [
    12, 14, 16, 20, 24, 32, 48, 72
  ],
  colors: {
    primary: '#50bf8d',
    secondary: '#black',
    lightgray: '#9FA4AE'
  },
  space: [
    0, 4, 8, 16, 32, 64, 128, 256
  ],
  fonts: {
      body: '"Roboto", sans-serif',
      heading: '"Roboto", sans-serif',
      text: '"Roboto", sans-serif'
  },
  fontWeights: {
      body: 400,
      heading: 525,
      bold: 700,
    },
  styles: {
      root: {
        fontFamily: 'body',
        fontWeight: 'body',
      },
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  shadows: {
    small: '0 0 4px rgba(0, 0, 0, .125)',
    large: '0 0 24px rgba(0, 0, 0, .125)'
  },
  variants: {
  },
  text: {
    'hover': {
      color: 'secondary',
    }
  },
  link: {
    textDecoration: 'none',
      color: 'white',
      '&:hover': {
          color: 'primary',
      }
  },
  buttons: {
    primary: {
      m: 3,
      color: 'white',
      bg: 'primary',
      lineHeight: 1.15,
      borderRadius: '0.316rem',
      padding: '.8rem',
      fontFamily: 'body',
      outline: 'none',
      cursor: 'pointer',
      transitionDuration: '0.4s',
      ':hover': {
        bg: '#35dd91'
      }
    },
  },
  forms: {
      input: {
          border: '0px solid',
          borderBottom: '1px solid',
          borderColor: 'lightgray',
          '&:focus': {
              outline: 'none',
              borderColor: 'primary',
          },
          '&:range': {

          }
      },
      select: {
        outline: 'none'
      }
    },
  heading: {
    fontSize: [ 3, 4 ],
    color: 'secondary',
  },
  flex: {
    bg: 'red'
  }
}

export const cardBoxFormatting = {
  ':hover': {
    backgroundColor: 'rgb(53, 55, 56)',
    transition: '200ms',
    transform: 'scale(1.08)'
  },
  m: [3, 4],
  p: 1,
  transition: '300ms',
  borderRadius: 2,
  boxShadow: '0 0 16px rgba(0, 0, 0, .75)',
  height: '200px',
  width: '250px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  cursor: 'pointer',
  backgroundColor:'rgb(22, 23, 24)',
  border:'solid 2px rgb(71, 211, 149, 0.20)'
}

export const tallCardBoxFormatting = {
  m: [3, 0, 0, 4],
  p: 1,
  transition: '300ms',
  borderRadius: 2,
  boxShadow: '0 0 16px rgba(0, 0, 0, .75)',
  height: '450px',
  width: '350px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  backgroundColor:'rgb(22, 23, 24)',
  border:'solid 2px rgb(71, 211, 149, 0.20)'
}

export const channelBoxFormatting = {
  ':hover': {
    backgroundColor: 'rgb(53, 55, 56)',
    transition: '200ms',
    transform: 'scale(1.08)'
  },
  m: [3, 4],
  p: 1,
  transition: '300ms',
  borderRadius: 2,
  boxShadow: '0 0 16px rgba(0, 0, 0, .75)',
  height: '250px',
  width: '320px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  cursor: 'pointer',
  backgroundColor:'rgb(22, 23, 24)',
  border:'solid 3px rgb(71, 211, 149, 0.20)'
}
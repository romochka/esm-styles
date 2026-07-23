export const Story = {
  '@keyframes storyAppear': {
    from: { opacity: 0, translate: '0 8px' },
    to: { opacity: 1, translate: '0 0' },
  },

  article: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    animation: 'storyAppear 0.3s ease-out',

    header: {
      h1: {
        fontSize: '2rem',
        lineHeight: 1.15,
      },
      p: {
        fontStyle: 'italic',
        color: $theme.ink.mild,
      },
    },

    Byline: {
      marginTop: '-0.5rem',
    },

    main: {
      img: {
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
        borderRadius: $device.radius.sm,
      },
    },

    footer: {
      fontSize: '0.8rem',

      a: {
        textDecoration: 'none',
        color: $theme.accent,
      },
    },

    compact: {
      flexDirection: 'row',
      gap: '1.5rem',

      header: {
        h1: {
          fontSize: '1.2rem',
        },
      },

      main: {
        img: {
          width: '10rem',
        },
        p: {
          display: 'none',
        },
      },

      footer: {
        display: 'none',
      },
    },

    urgent: {
      header: {
        h1: {
          color: $theme.accent,
        },
      },
    },
  },
} satisfies StyleOf<Markup.Story>

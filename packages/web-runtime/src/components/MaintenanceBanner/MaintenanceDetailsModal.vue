<template>
  <div>
    <p>
      {{
        $gettext('The system is in maintenance mode. Any access will fail during this mode like:')
      }}
    </p>

    <ul>
      <li>{{ $gettext('Accessing or changing a file or settings') }}</li>
      <li>{{ $gettext('Saving a file you are currently editing (*)') }}</li>
      <li>{{ $gettext('Changing to another Space or directory') }}</li>
    </ul>

    <p>
      {{
        $gettext(
          '* ... Saving an edited file may not immediately respond to the maintenance mode depending on its duration. If you get a warning that saving is not possible, save a backup of your file locally.'
        )
      }}
    </p>

    <p>
      {{
        $gettext(
          'If maintenance mode has finished, the yellow warning bar will automatically go away and full access is restored. You can now save an open edited file as usual.'
        )
      }}
    </p>
  </div>
</template>

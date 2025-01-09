"use client";

import { Button, Group, useMantineColorScheme } from "@mantine/core";
import { ThemeSwitcher } from "../../common/constants/general/theme-switcher";

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <Group justify="center" mt="xl">
      <Button onClick={() => setColorScheme(ThemeSwitcher.LIGHT)}>Light</Button>
      <Button onClick={() => setColorScheme(ThemeSwitcher.DARK)}>Dark</Button>
      <Button onClick={() => setColorScheme(ThemeSwitcher.AUTO)}>Auto</Button>
    </Group>
  );
}

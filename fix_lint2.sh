#!/bin/bash
sed -i 's/}, \[\])/  \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n  }, [])/g' src/app/\(dashboard\)/cards/page.tsx
sed -i 's/}, \[\])/  \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n  }, [])/g' src/app/\(dashboard\)/passes/page.tsx
sed -i 's/}, \[\])/  \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n  }, [])/g' src/app/\(dashboard\)/scans/page.tsx
sed -i 's/}, \[\])/  \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n  }, [])/g' src/app/c/\[slug\]/page.tsx
sed -i 's/catch (_error) {/catch {/g' src/lib/supabase/server.ts

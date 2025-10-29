#!/bin/bash

# Add hasRole import and update role checks
files=(
  "app/src/app/counselor/page.tsx"
  "app/src/app/counselor/forms/page.tsx"
  "app/src/app/admin/forms/[id]/assign/page.tsx"
  "app/src/app/admin/forms/[id]/page.tsx"
  "app/src/app/admin/counselors/page.tsx"
  "app/src/app/admin/counselors/new/page.tsx"
  "app/src/app/counselee/page.tsx"
  "app/src/app/api/admin/assign-form/route.ts"
  "app/src/app/api/admin/create-counselor-profile/route.ts"
  "app/src/app/api/admin/create-counselor/route.ts"
)

cd /Users/marklarson/Documents/GitHub/counseling-portal

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Add import if not already there
    if ! grep -q "hasRole" "$file"; then
      if grep -q "from '@/lib/auth/server'" "$file"; then
        # Add to existing import
        sed -i '' "s/from '@\/lib\/auth\/server'/from '@\/lib\/auth\/server';\nimport { hasRole } from '@\/lib\/auth\/roles'/" "$file"
      elif grep -q "from \"@/lib/auth/server\"" "$file"; then
        sed -i '' "s/from \"@\/lib\/auth\/server\"/from \"@\/lib\/auth\/server\";\nimport { hasRole } from '@\/lib\/auth\/roles'/" "$file"
      fi
    fi
    
    # Update role checks
    sed -i '' "s/user\.role !== 'admin'/!hasRole(user, 'admin')/g" "$file"
    sed -i '' "s/user\.role !== 'counselor' && user\.role !== 'admin'/!hasAnyRole(user, ['counselor', 'admin'])/g" "$file"
    sed -i '' "s/user\.role !== 'counselor'/!hasRole(user, 'counselor')/g" "$file"
    sed -i '' "s/user\.role !== 'counselee'/!hasRole(user, 'counselee')/g" "$file"
    
    # Add hasAnyRole import if needed
    if grep -q "hasAnyRole" "$file" && ! grep -q "import.*hasAnyRole" "$file"; then
      sed -i '' "s/import { hasRole }/import { hasRole, hasAnyRole }/" "$file"
    fi
  fi
done

echo "Done!"

## Managing translations

### Translation changes in 2.0
- Removed `client.csv` and `login.csv` which contained translations per service
- Created a `core-xx.csv` file per language containing core translations
- Created a `country-xx.csv` file per language containing country config translations
- Include core translations in OpenCRVS toolkit
- TODO maybe add something about vaildation here

### Keeping translations up to date
Every time you update OpenCRVS to the latest version, new translations may have been added to core or you may have added fields to your forms but forgot to create translations. 

For all cases, run `yarn validate:translations`

The script will show if you have:
- Missing translations
- Unused (stale) translations
- Blank translations (keys exist but value is empty)

The script will allow you to add missing, remove stale and print blank keys to be translated. 

This script will be run by github actions and will fail the pull request should migrations not be up to date.


### Migrating translations to 2.0
- Merge latest changes from [country config](https://github.com/opencrvs/opencrvs-countryconfig)
    - Make sure to keep your `client.csv` and `login.csv` when you resolve the merge conflict
    - If you've already deleted them in the merge, restore them from git
- Run `yarn validate:translations`
    - Select `Migrate legacy translations to 2.0`
    - This will create a new `country-xx.csv` for each language other than `en` and `fr` (as they should already exist)
- Follow the prompts to fix any blank translations left after the migration




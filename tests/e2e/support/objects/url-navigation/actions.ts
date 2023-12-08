import {Page} from "@playwright/test";
import {createLinkArgs} from "../app-files/link/actions";
import { getIdOfFileInsideSpace } from "../../api/davSpaces";

export interface navigateToDetailsPanelOfResourceArgs {
    page: Page
    resource: string
    panel: string
}

export const crnavigateToDetailsPanelOfResourceeateLink = async (args: navigateToDetailsPanelOfResourceArgs): Promise<string> => {
    const fileId = await getIdOfFileInsideSpace({
        user,
        pathToFileName: '',
        spaceType: 'personal',
        spaceName
    })

}

<script lang="ts">
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import Post from "./Post.svelte";
    import Timeline from "./Timeline.svelte";
    import { getTimeline, Timeline as TImelineType, TimelineGroup } from "$/tools/api/app";
    import { currentRoute } from "$/routes/_routing.svelte";

    export let account: string;
    let mentionsTimeline: TImelineType = null;
    $: timelineLength = mentionsTimeline?.lengthData.length;

    $: account, onAccountChange();
    async function onAccountChange() {
        mentionsTimeline = null;
        mentionsTimeline = await getTimeline({ timelineId: { group: TimelineGroup.ProfileMentions, id: account } });
    }
</script>

<KButton color="slave" radius="fab">
    {#if !mentionsTimeline}
        N...
    {:else}
        N: {$timelineLength}
        <KHoverMenu radius="rounded" color="master" size="normal" background direction="left">
            <div class="notifications">
                <b>Notifications</b>
                <Timeline timeline={mentionsTimeline} let:postIds>
                    {#each postIds as postId (postId.toString())}
                        <a href="#{$currentRoute.path}#{postId}">
                            <Post {postId} />
                        </a>
                    {/each}
                </Timeline>
            </div>
        </KHoverMenu>
    {/if}
</KButton>

<style>
    .notifications {
        width: min(40em, 100vw);
        padding: calc(var(--k-padding) * 2);
    }

    .notifications > b {
        font-size: var(--k-font-larger);
    }
</style>
